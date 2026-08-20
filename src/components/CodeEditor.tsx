import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { FileCode2, FolderOpen } from "lucide-react";
import type { FileName, ProjectFiles } from "../types";

type CodeEditorProps = {
  files: ProjectFiles;
  activeFile: FileName;
  onActiveFileChange: (file: FileName) => void;
  onChange: (value: string) => void;
};

const files: FileName[] = ["index.html", "styles.css", "script.js"];

const extensions = {
  "index.html": [html()],
  "styles.css": [css()],
  "script.js": [javascript()],
};

export function CodeEditor({ files: projectFiles, activeFile, onActiveFileChange, onChange }: CodeEditorProps) {
  return (
    <section className="code-region" aria-label="Project files and code editor">
      <aside className="file-panel">
        <div className="region-label">Files</div>
        <div className="tree-root"><FolderOpen size={16} /> /</div>
        {files.map((file) => (
          <button
            className={activeFile === file ? "active" : ""}
            key={file}
            onClick={() => onActiveFileChange(file)}
          >
            <FileCode2 size={16} className={`${file.split(".")[1]}-file`} /> {file}
          </button>
        ))}
      </aside>

      <div className="editor-panel">
        <div className="region-label">Code</div>
        <div className="editor-tab"><span>{activeFile}</span></div>
        <CodeMirror
          aria-label={`${activeFile} code editor`}
          className="codemirror-shell"
          value={projectFiles[activeFile]}
          height="100%"
          theme="dark"
          extensions={extensions[activeFile]}
          onChange={onChange}
          basicSetup={{
            autocompletion: true,
            bracketMatching: true,
            closeBrackets: true,
            highlightActiveLine: true,
            lineNumbers: true,
          }}
        />
      </div>
    </section>
  );
}

