export type CompilerLanguage = "python" | "javascript" | "cpp" | "java" | "six-tongue";

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

export const languageOrder: CompilerLanguage[] = ["python", "javascript", "cpp", "java", "six-tongue"];

export const languageInfo: Record<CompilerLanguage, { label: string; file: string; description: string; starter: string }> = {
  python: {
    label: "Python",
    file: "main.py",
    description: "Checked by Python's real parser. Your program is not run.",
    starter: `def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\n\nprint(greet("Clay"))\n`,
  },
  javascript: {
    label: "JavaScript",
    file: "main.js",
    description: "Checked by Node's parser. Your program is not run.",
    starter: `function greet(name) {\n  return \`Hello, ${name}!\`;\n}\n\nconsole.log(greet("Clay"));\n`,
  },
  cpp: {
    label: "C++",
    file: "main.cpp",
    description: "Checked by Microsoft C/C++ Build Tools in syntax-only mode.",
    starter: `#include <iostream>\n#include <string>\n\nint main() {\n    std::string name = "Clay";\n    std::cout << "Hello, " << name << "!\\n";\n    return 0;\n}\n`,
  },
  java: {
    label: "Java",
    file: "Main.java",
    description: "Compiled in a temporary folder by javac, then immediately discarded.",
    starter: `public class Main {\n    public static void main(String[] args) {\n        String name = "Clay";\n        System.out.println("Hello, " + name + "!");\n    }\n}\n`,
  },
  "six-tongue": {
    label: "Six Tongues",
    file: "expression.tongue",
    description: "Parsed into your stack-machine IR and emitted to Python and JavaScript without execution.",
    starter: `(a sai 2) tuu (b nok 1)\n`,
  },
};

type CompilerState = {
  language: CompilerLanguage;
  drafts: Record<CompilerLanguage, string>;
};

const STORAGE_KEY = "clay-code-builder.compiler.v1";

export function freshCompilerState(): CompilerState {
  return {
    language: "python",
    drafts: Object.fromEntries(languageOrder.map((language) => [language, languageInfo[language].starter])) as Record<CompilerLanguage, string>,
  };
}

export function loadCompilerState(): CompilerState {
  const clean = freshCompilerState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clean;
    const parsed = JSON.parse(raw) as Partial<CompilerState>;
    const language = languageOrder.includes(parsed.language as CompilerLanguage)
      ? parsed.language as CompilerLanguage
      : clean.language;
    const drafts = { ...clean.drafts };
    if (parsed.drafts && typeof parsed.drafts === "object") {
      for (const key of languageOrder) {
        if (typeof parsed.drafts[key] === "string" && parsed.drafts[key].length <= 32_000) drafts[key] = parsed.drafts[key];
      }
    }
    return { language, drafts };
  } catch {
    return clean;
  }
}

export function saveCompilerState(state: CompilerState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function checkCompilerSource(language: CompilerLanguage, source: string): Promise<CompilerResult> {
  const response = await fetch("/api/compiler/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, source }),
  });
  const payload = await response.json() as CompilerResult & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Compiler returned ${response.status}`);
  return payload;
}
