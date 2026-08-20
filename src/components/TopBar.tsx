import { BookOpen, FolderOpen, Layers3, MonitorCog, Moon, Sun } from "lucide-react";

export type AppView = "learn" | "projects" | "builds";

type TopBarProps = {
  view: AppView;
  onViewChange: (view: AppView) => void;
  projectName?: string;
  progress?: string;
  progressPercent?: number;
  dark: boolean;
  onToggleTheme: () => void;
};

export function TopBar({
  view,
  onViewChange,
  projectName,
  progress,
  progressPercent = 0,
  dark,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onViewChange("projects")}>
        <span className="brand-mark"><Layers3 size={23} strokeWidth={2.2} /></span>
        <span>Clay Code Builder</span>
      </button>

      {view === "learn" ? (
        <div className="project-progress" aria-label="Current project progress">
          <span>Current project:</span>
          <strong>{projectName}</strong>
          <span className="progress-copy">{progress}</span>
          <span className="progress-track" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </span>
        </div>
      ) : (
        <nav className="primary-nav" aria-label="Primary navigation">
          <button onClick={() => onViewChange("learn")}>
            <BookOpen size={19} /> Learn
          </button>
          <button className={view === "projects" ? "active" : ""} onClick={() => onViewChange("projects")}>
            <FolderOpen size={19} /> Projects
          </button>
          <button className={view === "builds" ? "active" : ""} onClick={() => onViewChange("builds")}>
            <MonitorCog size={19} /> My builds
          </button>
        </nav>
      )}

      <div className="top-actions">
        {view === "learn" && (
          <button className="quiet-button" onClick={() => onViewChange("projects")}>
            <FolderOpen size={18} /> Projects
          </button>
        )}
        <button className="icon-button" aria-label="Toggle theme" onClick={onToggleTheme}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
