import { Columns3, Lightbulb, LoaderCircle, MessageSquareText, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { askClay } from "../lib/tutor";
import type { TutorAction, TutorContext, TutorMessage } from "../types";

type ClayAssistantProps = {
  context: TutorContext;
};

const initialMessage: TutorMessage = {
  id: 1,
  role: "clay",
  text: "I can explain a file, give one hint, or compare your code with the working version.",
};

export function ClayAssistant({ context }: ClayAssistantProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([initialMessage]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const nextId = useMemo(() => Math.max(...messages.map((message) => message.id)) + 1, [messages]);

  const send = async (action: TutorAction, text = "") => {
    if (busy) return;
    const trimmed = text.trim();
    const learnerLabel = action === "question" ? trimmed : {
      explain: "Explain this file",
      hint: "Give me one hint",
      compare: "Compare my version",
    }[action];
    if (!learnerLabel) return;

    setBusy(true);
    setMessages((current) => [...current, { id: nextId, role: "learner", text: learnerLabel }]);
    const answer = await askClay(action, trimmed, context);
    setMessages((current) => [...current, { id: nextId + 1, role: "clay", text: answer }]);
    setQuestion("");
    setBusy(false);
  };

  return (
    <aside className="clay-assistant" aria-label="Ask Clay tutor">
      <div className="assistant-heading"><h2>Ask Clay</h2><span className="assistant-dot" title="Local project context" /></div>
      <div className="assistant-messages" aria-live="polite">
        {messages.slice(-6).map((message) => (
          <div className={`assistant-message ${message.role}`} key={message.id}>
            {message.role === "clay" && <span className="mini-brand">C</span>}
            <p>{message.text}</p>
          </div>
        ))}
        {busy && <div className="assistant-thinking"><LoaderCircle size={18} className="spin" /> Clay is tracing this project…</div>}
      </div>

      <div className="assistant-actions">
        <span>How can I help?</span>
        <button onClick={() => send("explain")}><MessageSquareText size={19} /> Explain this file</button>
        <button onClick={() => send("hint")}><Lightbulb size={19} /> Give one hint</button>
        <button onClick={() => send("compare")}><Columns3 size={19} /> Compare versions</button>
      </div>

      <form className="assistant-input" onSubmit={(event) => { event.preventDefault(); void send("question", question); }}>
        <input
          aria-label="Ask about this project"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this project..."
        />
        <button aria-label="Send question" disabled={!question.trim() || busy}><Send size={18} /></button>
      </form>
    </aside>
  );
}
