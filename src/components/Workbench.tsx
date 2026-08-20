import {
  Check,
  ChevronUp,
  Circle,
  Columns3,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  Terminal,
  Trash2,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { buildPreviewDocument, isPreviewMessage } from "../lib/preview";
import type { ConsoleEntry, FileName, ProjectFiles, ProjectTemplate } from "../types";
import { ClayAssistant } from "./ClayAssistant";

const CodeEditor = lazy(() => import("./CodeEditor").then((module) => ({ default: module.CodeEditor })));

type WorkbenchProps = {
  project: ProjectTemplate;
  files: ProjectFiles;
  completedSteps: number[];
  onFilesChange: (files: ProjectFiles) => void;
  onCompleteStep: (stepId: number) => void;
};

export function Workbench({
  project,
  files,
  completedSteps,
  onFilesChange,
  onCompleteStep,
}: WorkbenchProps) {
  const firstOpen = project.steps.findIndex((step) => !completedSteps.includes(step.id));
  const [stepIndex, setStepIndex] = useState(firstOpen >= 0 ? firstOpen : 0);
  const [activeFile, setActiveFile] = useState<FileName>(project.steps[firstOpen >= 0 ? firstOpen : 0].focusFile);
  const [previewDocument, setPreviewDocument] = useState(() => buildPreviewDocument(files));
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [editorWide, setEditorWide] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [runVersion, setRunVersion] = useState(1);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([
    { id: 1, level: "success", text: "Preview rebuilt. No errors." },
  ]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const entryId = useRef(2);
  const step = project.steps[stepIndex] ?? project.steps[0];

  useEffect(() => {
    setActiveFile(step.focusFile);
  }, [step.focusFile]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || !isPreviewMessage(event.data)) return;
      setConsoleEntries((current) => [
        ...current.slice(-29),
        {
          id: entryId.current++,
          level: event.data.level,
          text: event.data.values.join(" "),
        },
      ]);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const tutorContext = useMemo(() => ({ project, step, activeFile, files }), [project, step, activeFile, files]);

  const runProject = () => {
    const result = step.check(files, project.files);
    setConsoleEntries([
      {
        id: entryId.current++,
        level: result.pass ? "success" : "info",
        text: result.message,
      },
    ]);
    setPreviewDocument(buildPreviewDocument(files));
    setRunVersion((version) => version + 1);
    setConsoleOpen(true);
    if (result.pass) onCompleteStep(step.id);
  };

  const resetFocusedFile = () => {
    onFilesChange({ ...files, [step.focusFile]: project.files[step.focusFile] });
    setActiveFile(step.focusFile);
    setConsoleEntries([{ id: entryId.current++, level: "info", text: `${step.focusFile} returned to the copied working version.` }]);
  };

  return (
    <main className={`workbench ${editorWide ? "editor-wide" : ""} ${consoleOpen ? "" : "console-closed"}`}>
      <aside className="build-path">
        <h2>Build path</h2>
        <ol>
          {project.steps.map((item, index) => {
            const complete = completedSteps.includes(item.id);
            return (
              <li key={item.id} className={index === stepIndex ? "selected" : ""}>
                <button onClick={() => setStepIndex(index)}>
                  <span className={complete ? "step-number complete" : "step-number"}>
                    {complete ? <Check size={16} /> : item.id}
                  </span>
                  <span>{item.id}. {item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="path-tip">
          <Circle size={10} fill="currentColor" />
          <p><strong>Tip:</strong> Follow the steps in order. Each one builds on the last.</p>
        </div>
      </aside>

      <section className="lesson-workspace">
        <header className="lesson-instruction">
          <div>
            <h1>{step.title === "Change the heading" ? "Change what the visitor sees" : step.title}</h1>
            <p>{step.instruction}</p>
          </div>
          <div className="instruction-actions">
            <button className="primary-button" onClick={runProject}><Play size={18} fill="currentColor" /> Run project</button>
            <button className="outline-button" onClick={resetFocusedFile}><RotateCcw size={18} /> Reset step</button>
          </div>
        </header>

        <div className="build-split">
          <Suspense fallback={<div className="editor-loading">Opening the code editor…</div>}>
            <CodeEditor
              files={files}
              activeFile={activeFile}
              onActiveFileChange={setActiveFile}
              onChange={(value) => onFilesChange({ ...files, [activeFile]: value })}
            />
          </Suspense>

          <button
            className="split-toggle"
            aria-label="Change code and preview proportions"
            title="Change code and preview proportions"
            onClick={() => setEditorWide((wide) => !wide)}
          >
            <Columns3 size={17} />
          </button>

          <section className="preview-region" aria-label="Live project preview">
            <div className="preview-toolbar">
              <span>Preview</span>
              <div>
                <button className={previewMode === "desktop" ? "active" : ""} aria-label="Desktop preview" onClick={() => setPreviewMode("desktop")}><Monitor size={18} /></button>
                <button className={previewMode === "mobile" ? "active" : ""} aria-label="Mobile preview" onClick={() => setPreviewMode("mobile")}><Smartphone size={18} /></button>
              </div>
            </div>
            <div className={`preview-canvas ${previewMode}`}>
              <iframe
                key={runVersion}
                ref={iframeRef}
                title={`${project.name} preview`}
                sandbox="allow-scripts"
                srcDoc={previewDocument}
              />
            </div>
          </section>
        </div>

        <section className="console-panel" aria-label="Project console">
          <header>
            <span><Terminal size={17} /> Console</span>
            <div>
              <button onClick={() => setConsoleEntries([])}><Trash2 size={15} /> Clear</button>
              <button aria-label="Toggle console" onClick={() => setConsoleOpen((open) => !open)}><ChevronUp size={17} /></button>
            </div>
          </header>
          <div className="console-output" aria-live="polite">
            {consoleEntries.length === 0 ? (
              <p className="muted">Console cleared.</p>
            ) : consoleEntries.map((entry) => (
              <p className={entry.level} key={entry.id}><span />{entry.text}</p>
            ))}
          </div>
        </section>
      </section>

      <ClayAssistant context={tutorContext} />
    </main>
  );
}
