import { Calculator, ChevronRight, CloudSun, Copy, Eye, FileCode2, Sprout } from "lucide-react";
import type { ProjectTemplate } from "../types";

type ProjectLibraryProps = {
  projects: ProjectTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCopy: (project: ProjectTemplate) => void;
  onPreview: (project: ProjectTemplate) => void;
  lastBuild?: string;
};

function ProjectGlyph({ project }: { project: ProjectTemplate }) {
  if (project.icon === "calculator") return <Calculator size={54} strokeWidth={1.6} />;
  if (project.icon === "weather") return <CloudSun size={58} strokeWidth={1.6} />;
  return <Sprout size={58} strokeWidth={1.6} />;
}

export function ProjectLibrary({
  projects,
  selectedId,
  onSelect,
  onCopy,
  onPreview,
  lastBuild,
}: ProjectLibraryProps) {
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];

  return (
    <main className="projects-page">
      <section className="project-catalog">
        <div className="page-heading">
          <h1>Copy a working project. Then make it yours.</h1>
          <p>Open the finished version first, copy it into your workspace, and change one thing at a time.</p>
        </div>

        <div className="project-list" role="list">
          {projects.map((project) => (
            <article
              className={`project-row ${selected.id === project.id ? "selected" : ""}`}
              key={project.id}
              onClick={() => onSelect(project.id)}
              role="listitem"
            >
              <div className={`project-glyph ${project.icon}`}><ProjectGlyph project={project} /></div>
              <div className="project-row-copy">
                <h2>{project.name}</h2>
                <p className="tech-line">
                  {project.technologies.join(" · ")} <span aria-hidden="true">|</span> <strong>{project.level}</strong>
                </p>
                <p>{project.description}</p>
              </div>
              {project.copyable ? (
                <button className={selected.id === project.id ? "primary-button" : "outline-button"} onClick={(event) => { event.stopPropagation(); onCopy(project); }}>
                  <Copy size={19} /> Copy &amp; open
                </button>
              ) : (
                <button className="outline-button" onClick={(event) => { event.stopPropagation(); onPreview(project); }}>
                  <Eye size={19} /> Preview
                </button>
              )}
            </article>
          ))}
        </div>

        {lastBuild && (
          <button className="last-build" onClick={() => onPreview(selected)}>
            <span>My last build: <strong>{lastBuild}</strong> · saved locally</span>
            <ChevronRight size={20} />
          </button>
        )}
      </section>

      <aside className="project-inspector">
        <h2>{selected.name}</h2>
        <div className="inspector-rule" />
        <div className="mini-tree">
          <strong><span>⌄</span> {selected.name}</strong>
          <span><FileCode2 size={18} className="html-file" /> index.html</span>
          <span><FileCode2 size={18} className="css-file" /> styles.css</span>
          <span><FileCode2 size={18} className="js-file" /> script.js</span>
        </div>
        <div className="inspector-rule" />
        <section>
          <h3>What you will notice</h3>
          <ul>
            <li>Files organize the project</li>
            <li>Code changes the preview</li>
            <li>The console tells you what happened</li>
          </ul>
        </section>
        <div className="inspector-rule" />
        <section>
          <h3>Learning sequence</h3>
          <p>Watch → Copy → Change → Recall → Build</p>
        </section>
        <div className="inspector-spacer" />
        {selected.copyable ? (
          <button className="primary-button inspector-action" onClick={() => onCopy(selected)}>
            <Copy size={19} /> Copy project into my workspace
          </button>
        ) : (
          <button className="primary-button inspector-action" onClick={() => onPreview(selected)}>
            <Eye size={19} /> Open project preview
          </button>
        )}
        <button className="text-button" onClick={() => onPreview(selected)}>Open finished preview</button>
      </aside>
    </main>
  );
}

