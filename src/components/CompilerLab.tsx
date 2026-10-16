import type { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { CheckCircle2, Clipboard, Code2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  checkCompilerSource,
  languageInfo,
  languageOrder,
  loadCompilerState,
  saveCompilerState,
  type CompilerLanguage,
  type CompilerResult,
} from "../lib/compiler";

const symbols = ["Tab", "{", "}", ":", ";", '"', "'", "#", "<", ">", "(", ")", "[", "]", "=", "-", "+", "*", "/", "^"];

export function CompilerLab() {
  const [state, setState] = useState(loadCompilerState);
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState("");
  const editor = useRef<EditorView | null>(null);
  const info = languageInfo[state.language];
  const source = state.drafts[state.language];

  useEffect(() => saveCompilerState(state), [state]);

  const setLanguage = (language: CompilerLanguage) => {
    setState((current) => ({ ...current, language }));
    setResult(null);
    setProblem("");
  };

  const setSource = (value: string) => {
    setState((current) => ({ ...current, drafts: { ...current.drafts, [current.language]: value } }));
    setResult(null);
    setProblem("");
  };

  const insertSymbol = (symbol: string) => {
    const view = editor.current;
    if (!view) return;
    const text = symbol === "Tab" ? "    " : symbol;
    const selection = view.state.selection.main;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
      scrollIntoView: true,
    });
    view.focus();
  };

  const check = async () => {
    setChecking(true);
    setProblem("");
    setResult(null);
    try {
      setResult(await checkCompilerSource(state.language, source));
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Compiler check failed.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="compiler-lab">
      <header className="compiler-intro">
        <div>
          <span className="compiler-kicker"><ShieldCheck size={17} /> VERIFY BEFORE YOU RUN</span>
          <h1>Clay Compiler Lab</h1>
          <p>Write code, send it through the real language parser, and read the exact diagnostics. Check never executes learner code.</p>
        </div>
        <div className="compiler-actions">
          <button className="primary-button" onClick={check} disabled={checking || !source.trim()}>
            <Code2 size={18} /> {checking ? "Checking…" : "Check code"}
          </button>
          <button className="outline-button" onClick={() => setSource(info.starter)}>
            <RotateCcw size={17} /> Starter
          </button>
        </div>
      </header>

      <nav className="language-tabs" aria-label="Compiler language">
        {languageOrder.map((language) => (
          <button
            key={language}
            className={state.language === language ? "active" : ""}
            onClick={() => setLanguage(language)}
          >
            {languageInfo[language].label}
          </button>
        ))}
      </nav>

      <section className="compiler-grid">
        <div className="compiler-editor-card">
          <header>
            <span>{info.file}</span>
            <small>{source.length.toLocaleString()} / 32,000 characters</small>
          </header>
          <div className="compiler-editor">
            <CodeMirror
              aria-label={`${info.label} source editor`}
              value={source}
              height="100%"
              theme="dark"
              extensions={[]}
              onCreateEditor={(view) => { editor.current = view; }}
              onChange={setSource}
              basicSetup={{
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                highlightActiveLine: true,
                lineNumbers: true,
              }}
            />
          </div>
          <div className="symbol-row" aria-label="Coding symbols">
            {symbols.map((symbol) => <button key={symbol} onClick={() => insertSymbol(symbol)}>{symbol}</button>)}
          </div>
        </div>

        <aside className="compiler-output-card" aria-live="polite">
          <header>
            <span>Compiler result</span>
            {result && <button aria-label="Copy diagnostics" onClick={() => navigator.clipboard?.writeText(result.diagnostics)}><Clipboard size={16} /></button>}
          </header>
          <div className="compiler-description">{info.description}</div>
          {!result && !problem && !checking && (
            <div className="compiler-empty"><Code2 size={34} /><p>Press <strong>Check code</strong> to ask the language toolchain whether this source is structurally valid.</p></div>
          )}
          {checking && <div className="compiler-empty"><div className="compiler-pulse" /><p>Checking in an isolated temporary workspace…</p></div>}
          {problem && <div className="compiler-verdict fail"><XCircle size={23} /><div><strong>Gateway error</strong><p>{problem}</p></div></div>}
          {result && (
            <>
              <div className={`compiler-verdict ${result.ok ? "pass" : "fail"}`}>
                {result.ok ? <CheckCircle2 size={23} /> : <XCircle size={23} />}
                <div>
                  <strong>{result.ok ? "Check passed" : "Check failed"}</strong>
                  <p>{result.compiler} · {result.durationMs} ms · exit {result.exitCode}</p>
                </div>
              </div>
              <pre className="compiler-diagnostics">{result.diagnostics}</pre>
              {result.artifact && (
                <details className="compiler-artifact">
                  <summary>Generated targets</summary>
                  <h3>Intermediate representation</h3>
                  <pre>{result.artifact.ir}</pre>
                  <h3>Python</h3>
                  <pre>{result.artifact.python}</pre>
                  <h3>JavaScript</h3>
                  <pre>{result.artifact.javascript}</pre>
                </details>
              )}
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
