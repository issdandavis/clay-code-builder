import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import type { Plugin } from "vite";

export const compilerLanguages = ["python", "javascript", "cpp", "java", "six-tongue"] as const;
export type CompilerLanguage = (typeof compilerLanguages)[number];

export type CompilerRequest = {
  language: CompilerLanguage;
  source: string;
};

export type CompilerResult = {
  ok: boolean;
  language: CompilerLanguage;
  phase: "check";
  compiler: string;
  exitCode: number;
  diagnostics: string;
  durationMs: number;
  artifact?: {
    ir: string;
    arguments: string[];
    python: string;
    javascript: string;
  };
};

const MAX_REQUEST_BYTES = 40_000;
const MAX_SOURCE_CHARS = 32_000;
const MAX_OUTPUT_CHARS = 48_000;
const TIMEOUT_MS = 15_000;
const PYTHON = process.env.CLAY_PYTHON?.trim() || "python";
const JAVAC_CANDIDATES = [
  process.env.CLAY_JAVAC?.trim(),
  "C:/Users/issda/.jdks/jdk-24.0.2/bin/javac.exe",
].filter((value): value is string => Boolean(value));
const VS_DEVCMD_CANDIDATES = [
  process.env.CLAY_VS_DEVCMD?.trim(),
  "C:/Program Files (x86)/Microsoft Visual Studio/2022/BuildTools/Common7/Tools/VsDevCmd.bat",
].filter((value): value is string => Boolean(value));

export class CompilerGatewayError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function firstExisting(paths: string[]): string | undefined {
  return paths.find((path) => existsSync(path));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCompilerPayload(value: unknown): CompilerRequest {
  if (!isRecord(value)) throw new CompilerGatewayError("request body must be an object");
  if (typeof value.language !== "string" || !compilerLanguages.includes(value.language as CompilerLanguage)) {
    throw new CompilerGatewayError(`language must be one of: ${compilerLanguages.join(", ")}`);
  }
  if (typeof value.source !== "string" || !value.source.trim()) {
    throw new CompilerGatewayError("source is required");
  }
  if (value.source.length > MAX_SOURCE_CHARS) {
    throw new CompilerGatewayError(`source exceeds ${MAX_SOURCE_CHARS} characters`, 413);
  }
  if (value.source.includes("\u0000")) throw new CompilerGatewayError("source contains a null byte");
  return { language: value.language as CompilerLanguage, source: value.source };
}

type ProcessResult = { code: number; stdout: string; stderr: string; durationMs: number };

function runBounded(
  command: string,
  args: string[],
  options: { cwd: string; input?: string; env?: NodeJS.ProcessEnv },
): Promise<ProcessResult> {
  return new Promise((resolveRun, rejectRun) => {
    const started = performance.now();
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (error?: Error, code = -1) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) rejectRun(error);
      else resolveRun({ code, stdout, stderr, durationMs: Math.round(performance.now() - started) });
    };
    const append = (current: string, chunk: Buffer | string) => {
      const next = current + chunk.toString();
      if (next.length > MAX_OUTPUT_CHARS) {
        child.kill();
        finish(new CompilerGatewayError("compiler diagnostics exceeded the output budget", 502));
      }
      return next;
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(new CompilerGatewayError("compiler check exceeded 15 seconds", 504));
    }, TIMEOUT_MS);
    child.stdout.on("data", (chunk) => { stdout = append(stdout, chunk); });
    child.stderr.on("data", (chunk) => { stderr = append(stderr, chunk); });
    child.on("error", (error) => finish(new CompilerGatewayError(`compiler could not start: ${error.message}`, 503)));
    child.on("close", (code) => finish(undefined, code ?? -1));
    child.stdin.end(options.input ?? "");
  });
}

function cleanDiagnostics(text: string, workspace: string): string {
  return text
    .replaceAll(workspace, "<workspace>")
    .replaceAll(workspace.replaceAll("\\", "/"), "<workspace>")
    .trim()
    .slice(0, MAX_OUTPUT_CHARS);
}

function assertSafeCppSource(source: string): void {
  // MSVC /Zs does not execute the learner's program, but its preprocessor can still read files.
  // Keep includes on the installed SDK/toolchain search path and refuse aliases or probes that
  // could turn a syntax checker into a local-file oracle.
  const joined = source.replaceAll(/\\\r?\n/g, "");
  if (/\b__has_include(?:_next)?\s*\(/.test(joined) || /#\s*pragma\s+include_alias\b/i.test(joined)) {
    throw new CompilerGatewayError("C++ include probes and aliases are unavailable in the learning checker");
  }
  for (const line of joined.split(/\r?\n/)) {
    const directive = line.match(/^\s*#\s*(include|include_next|import|using)\b(.*)$/i);
    if (!directive) continue;
    if (directive[1].toLowerCase() !== "include") {
      throw new CompilerGatewayError(`C++ #${directive[1]} is unavailable in the learning checker`);
    }
    const include = directive[2].trim().match(/^<([A-Za-z][A-Za-z0-9_.\/-]*)>\s*(?:\/\/.*)?$/);
    const path = include?.[1];
    if (!path || path.includes("..") || path.includes(":")) {
      throw new CompilerGatewayError("C++ includes must be literal standard-library headers such as <iostream>");
    }
  }
}

export function compilerHealth() {
  return {
    python: true,
    javascript: true,
    cpp: Boolean(firstExisting(VS_DEVCMD_CANDIDATES)),
    java: Boolean(firstExisting(JAVAC_CANDIDATES)),
    "six-tongue": existsSync("C:/dev/tongue-compiler/tonguec.py"),
    execution: false,
  };
}

export async function checkSource(request: CompilerRequest): Promise<CompilerResult> {
  const workspace = mkdtempSync(join(tmpdir(), "clay-check-"));
  try {
    let processResult: ProcessResult;
    let compiler = "";
    let artifact: CompilerResult["artifact"];

    if (request.language === "python") {
      const source = join(workspace, "main.py");
      writeFileSync(source, request.source, "utf8");
      compiler = "Python py_compile";
      processResult = await runBounded(PYTHON, ["-I", "-m", "py_compile", source], {
        cwd: workspace,
        env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
      });
    } else if (request.language === "javascript") {
      const source = join(workspace, "main.js");
      writeFileSync(source, request.source, "utf8");
      compiler = `Node ${process.version} --check`;
      processResult = await runBounded(process.execPath, ["--check", source], { cwd: workspace });
    } else if (request.language === "java") {
      const javac = firstExisting(JAVAC_CANDIDATES);
      if (!javac) throw new CompilerGatewayError("Java compiler is unavailable", 503);
      const source = join(workspace, "Main.java");
      const classes = join(workspace, "classes");
      writeFileSync(source, request.source, "utf8");
      compiler = `javac (${basename(javac)})`;
      processResult = await runBounded(javac, ["-encoding", "UTF-8", "-proc:none", "-d", classes, source], { cwd: workspace });
    } else if (request.language === "cpp") {
      assertSafeCppSource(request.source);
      const devcmd = firstExisting(VS_DEVCMD_CANDIDATES);
      if (!devcmd) throw new CompilerGatewayError("C++ Build Tools are unavailable", 503);
      const source = join(workspace, "main.cpp");
      writeFileSync(source, request.source, "utf8");
      compiler = "Microsoft C/C++ syntax check";
      const nativeDevcmd = devcmd.replaceAll("/", "\\");
      const script = join(workspace, "check.cmd");
      writeFileSync(
        script,
        `@echo off\r\ncall "${nativeDevcmd}" -no_logo -arch=x64 -host_arch=x64 >nul\r\nif errorlevel 1 exit /b %errorlevel%\r\ncl.exe /nologo /std:c++17 /EHsc /Zs "%~dp0main.cpp"\r\n`,
        "utf8",
      );
      processResult = await runBounded("cmd.exe", ["/d", "/c", script], { cwd: workspace });
    } else {
      const helper = resolve(process.cwd(), "server", "tongueCheck.py");
      compiler = "TongueC source → AST → IR → Python/JavaScript";
      processResult = await runBounded(PYTHON, ["-I", helper], {
        cwd: workspace,
        input: request.source,
        env: { ...process.env, CLAY_TONGUE_COMPILER: process.env.CLAY_TONGUE_COMPILER || "C:/dev/tongue-compiler" },
      });
      let payload: Record<string, unknown> = {};
      try { payload = JSON.parse(processResult.stdout) as Record<string, unknown>; } catch { /* handled below */ }
      if (payload.ok === true) {
        artifact = {
          ir: String(payload.ir ?? ""),
          arguments: Array.isArray(payload.arguments) ? payload.arguments.map(String) : [],
          python: String(payload.python ?? ""),
          javascript: String(payload.javascript ?? ""),
        };
        processResult.stdout = `IR: ${artifact.ir}\nArguments: ${artifact.arguments.join(", ") || "none"}\nTargets emitted: Python, JavaScript`;
      } else if (typeof payload.error === "string") {
        processResult.stderr = payload.error;
      }
    }

    const diagnostics = cleanDiagnostics([processResult.stdout, processResult.stderr].filter(Boolean).join("\n"), workspace);
    const ok = processResult.code === 0 && (request.language !== "six-tongue" || Boolean(artifact));
    return {
      ok,
      language: request.language,
      phase: "check",
      compiler,
      exitCode: processResult.code,
      diagnostics: diagnostics || (ok ? "No syntax errors found." : "The compiler rejected this source."),
      durationMs: processResult.durationMs,
      ...(artifact ? { artifact } : {}),
    };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    let tooLarge = false;
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) tooLarge = true;
    });
    request.on("end", () => {
      if (tooLarge) return rejectBody(new CompilerGatewayError("request exceeds 40,000 bytes", 413));
      try { resolveBody(JSON.parse(body)); }
      catch { rejectBody(new CompilerGatewayError("request body must be valid JSON")); }
    });
    request.on("error", rejectBody);
  });
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(payload));
}

export function compilerGatewayPlugin(): Plugin {
  const middleware = async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    if (pathname === "/api/compiler/health" && request.method === "GET") {
      sendJson(response, 200, { ok: true, profiles: compilerHealth() });
      return;
    }
    if (pathname !== "/api/compiler/check") return next();
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "method_not_allowed" });
      return;
    }
    try {
      const payload = validateCompilerPayload(await readJsonBody(request));
      sendJson(response, 200, await checkSource(payload));
    } catch (error) {
      const gatewayError = error instanceof CompilerGatewayError
        ? error
        : new CompilerGatewayError(error instanceof Error ? error.message : "compiler unavailable", 503);
      sendJson(response, gatewayError.status, { error: gatewayError.message });
    }
  };
  return {
    name: "clay-code-builder-compiler",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
