import type { FileName, TutorAction, TutorContext } from "../types";

const FILE_JOBS: Record<FileName, string> = {
  "index.html": "HTML names and organizes what exists on the page. Tags such as <h1> and <button> give content structure.",
  "styles.css": "CSS controls presentation: color, spacing, layout, size, and responsive behavior. It selects the names HTML provides.",
  "script.js": "JavaScript controls behavior. It listens for events, changes values, and updates the HTML the visitor sees.",
};

function explain(context: TutorContext): string {
  const firstMeaningfulLine = context.files[context.activeFile]
    .split("\n")
    .find((line) => line.trim() && !line.trim().startsWith("//"));
  return `${FILE_JOBS[context.activeFile]} In this file, start with: ${firstMeaningfulLine?.trim() ?? "the first non-empty line"}. Ask me about a specific tag, selector, or function and I’ll trace it to the preview.`;
}

function compare(context: TutorContext): string {
  const changes = (Object.keys(context.files) as FileName[]).filter(
    (file) => context.files[file].trim() !== context.project.files[file].trim(),
  );
  if (!changes.length) {
    return "Your workspace still matches the copied working version. Make one small change, run it, then compare again.";
  }
  const jobs = changes.map((file) => `${file} (${FILE_JOBS[file].split(".")[0].toLowerCase()})`);
  return `You changed ${jobs.join(", ")}. I’m naming the changed layers instead of pasting the answer so you can connect each edit to what moved in the preview.`;
}

function answerQuestion(question: string, context: TutorContext): string {
  const lower = question.toLowerCase();
  if (/\b(h1|heading)\b/.test(lower)) {
    return "<h1> is the page’s main heading. The opening tag starts it, the words are visible content, and </h1> closes it. Change only the words first and watch the Preview.";
  }
  if (/\b(class|selector)\b/.test(lower)) {
    return "A class is a reusable name on an HTML element. CSS selects it with a dot, so class=\"garden-card\" connects to .garden-card in styles.css.";
  }
  if (/\b(id|queryselector)\b/.test(lower)) {
    return "An id names one particular element. document.querySelector(\"#status\") uses # to find id=\"status\" so JavaScript can change that element.";
  }
  if (/\b(event|click|listener)\b/.test(lower)) {
    return "An event is something that happens. addEventListener(\"click\", ...) stores a function that the browser runs later, when the visitor clicks.";
  }
  if (/\b(console|error|log)\b/.test(lower)) {
    return "The Preview is what a visitor sees. The Console is what the program reports. A console error often names the file, line, and kind of mistake even when the preview looks blank.";
  }
  if (/\b(file|where)\b/.test(lower)) return FILE_JOBS[context.activeFile];
  return `For “${question}”, trace one visible result backward: Preview → ${context.activeFile} → the line that names or changes it. Your current step is “${context.step.title}”. ${context.step.hint}`;
}

export function getLocalTutorReply(
  action: TutorAction,
  question: string,
  context: TutorContext,
): string {
  if (action === "explain") return explain(context);
  if (action === "hint") return `One hint: ${context.step.hint} Try that, run the project, and tell me what changed.`;
  if (action === "compare") return compare(context);
  return answerQuestion(question, context);
}

export async function askClay(
  action: TutorAction,
  question: string,
  context: TutorContext,
): Promise<string> {
  const endpoint = import.meta.env.VITE_CLAY_API_URL?.trim() || (import.meta.env.DEV ? "/api/clay" : "");
  if (!endpoint) return getLocalTutorReply(action, question, context);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        question,
        context: {
          project: context.project.name,
          step: context.step.title,
          instruction: context.step.instruction,
          activeFile: context.activeFile,
          activeCode: context.files[context.activeFile].slice(0, 12_000),
        },
      }),
    });
    if (!response.ok) throw new Error(`Clay endpoint returned ${response.status}`);
    const payload = (await response.json()) as { answer?: unknown };
    if (typeof payload.answer !== "string" || !payload.answer.trim()) {
      throw new Error("Clay endpoint returned no answer");
    }
    return payload.answer.trim();
  } catch {
    return `${getLocalTutorReply(action, question, context)} (The optional Clay endpoint was unavailable, so I used the built-in project tutor.)`;
  }
}
