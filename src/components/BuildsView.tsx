import { ChevronRight, FolderOpen, Plus } from "lucide-react";
import type { ProjectTemplate } from "../types";

type BuildsViewProps = {
  projects: ProjectTemplate[];
  copiedIds: string[];
  onOpen: (project: ProjectTemplate) => void;
  onProjects: () => void;
};

export function BuildsView({ projects, copiedIds, onOpen, onProjects }: BuildsViewProps) {
  const builds = projects.filter((project) => copiedIds.includes(project.id));
  return (
    <main className="builds-page">
      <div className="page-heading">
        <h1>My builds</h1>
        <p>These copies live in this browser. Open one and continue where you stopped.</p>
      </div>
      {builds.length ? (
        <div className="build-list">
          {builds.map((project) => (
            <button key={project.id} onClick={() => onOpen(project)}>
              <span className="build-folder"><FolderOpen size={22} /></span>
              <span><strong>{project.name} remix</strong><small>{project.technologies.join(" · ")} · saved locally</small></span>
              <ChevronRight size={21} />
            </button>
          ))}
        </div>
      ) : (
        <section className="empty-builds">
          <FolderOpen size={42} />
          <h2>No project copies yet</h2>
          <p>Start with a finished project, copy it, then change one thing at a time.</p>
          <button className="primary-button" onClick={onProjects}><Plus size={18} /> Choose a project</button>
        </section>
      )}
    </main>
  );
}

