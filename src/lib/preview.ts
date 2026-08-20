import type { ProjectFiles } from "../types";

const escapeScriptClose = (source: string) => source.replace(/<\/script/gi, "<\\/script");

export function buildPreviewDocument(files: ProjectFiles): string {
  let html = files["index.html"]
    .replace(/<link[^>]+href=["']styles\.css["'][^>]*>/gi, "")
    .replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/gi, "");

  const security = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; font-src 'none'; media-src 'none'; frame-src 'none'">`;
  const style = `<style>${files["styles.css"]}</style>`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${security}${style}</head>`);
  } else {
    html = `${security}${style}${html}`;
  }

  const bridge = `<script>
(() => {
  const send = (level, values) => parent.postMessage({
    source: "clay-preview",
    level,
    values: values.map((value) => {
      if (typeof value === "string") return value;
      try { return JSON.stringify(value); } catch { return String(value); }
    })
  }, "*");
  ["log", "info", "warn", "error"].forEach((level) => {
    const original = console[level];
    console[level] = (...values) => { send(level, values); original(...values); };
  });
  window.addEventListener("error", (event) => send("error", [event.message]));
  window.addEventListener("unhandledrejection", (event) => send("error", [String(event.reason)]));
})();
<\/script>`;
  const learnerScript = `<script>${escapeScriptClose(files["script.js"])}</script>`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${bridge}${learnerScript}</body>`);
  }
  return `${html}${bridge}${learnerScript}`;
}

export function isPreviewMessage(value: unknown): value is {
  source: "clay-preview";
  level: "log" | "info" | "warn" | "error";
  values: string[];
} {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    message.source === "clay-preview" &&
    ["log", "info", "warn", "error"].includes(String(message.level)) &&
    Array.isArray(message.values) &&
    message.values.every((item) => typeof item === "string")
  );
}

