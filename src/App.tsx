import { useEffect, useMemo, useState } from "react";
import { BuildsView } from "./components/BuildsView";
import { ProjectLibrary } from "./components/ProjectLibrary";
import { TopBar, type AppView } from "./components/TopBar";
import { Workbench } from "./components/Workbench";
import { cloneProjectFiles, getProject, projects } from "./data/projects";
import { loadState, saveState, type SavedState } from "./lib/storage";
import type { ProjectFiles, ProjectTemplate } from "./types";

export default function App() {
  const [saved, setSaved] = useState<SavedState>(() => loadState());
  const [view, setView] = useState<AppView>(saved.copiedProjects.length ? "learn" : "projects");
  const [selectedProjectId, setSelectedProjectId] = useState(saved.lastProjectId);
  const [dark, setDark] = useState(false);
  const project = useMemo(() => getProject(selectedProjectId), [selectedProjectId]);
  const files = saved.workspaces[project.id] ?? cloneProjectFiles(project);
  const completedSteps = saved.completedSteps[project.id] ?? [];
  const progressPercent = Math.round((completedSteps.length / project.steps.length) * 100);

  useEffect(() => {
    saveState(saved);
  }, [saved]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const copyProject = (template: ProjectTemplate) => {
    setSelectedProjectId(template.id);
    setSaved((current) => ({
      ...current,
      workspaces: { ...current.workspaces, [template.id]: cloneProjectFiles(template) },
      copiedProjects: current.copiedProjects.includes(template.id)
        ? current.copiedProjects
        : [...current.copiedProjects, template.id],
      completedSteps: {
        ...current.completedSteps,
        [template.id]: template.steps.length > 1 ? [template.steps[0].id] : [],
      },
      lastProjectId: template.id,
    }));
    setView("learn");
  };

  const previewProject = (template: ProjectTemplate) => {
    setSelectedProjectId(template.id);
    setSaved((current) => ({
      ...current,
      workspaces: current.workspaces[template.id]
        ? current.workspaces
        : { ...current.workspaces, [template.id]: cloneProjectFiles(template) },
      lastProjectId: template.id,
    }));
    setView("learn");
  };

  const updateFiles = (nextFiles: ProjectFiles) => {
    setSaved((current) => ({
      ...current,
      workspaces: { ...current.workspaces, [project.id]: nextFiles },
      lastProjectId: project.id,
    }));
  };

  const completeStep = (stepId: number) => {
    setSaved((current) => {
      const currentSteps = current.completedSteps[project.id] ?? [];
      return {
        ...current,
        completedSteps: {
          ...current.completedSteps,
          [project.id]: currentSteps.includes(stepId) ? currentSteps : [...currentSteps, stepId],
        },
      };
    });
  };

  return (
    <div className="app-shell">
      <TopBar
        view={view}
        onViewChange={setView}
        projectName={project.name}
        progress={`${completedSteps.length} of ${project.steps.length} complete`}
        progressPercent={progressPercent}
        dark={dark}
        onToggleTheme={() => setDark((value) => !value)}
      />

      {view === "projects" && (
        <ProjectLibrary
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={setSelectedProjectId}
          onCopy={copyProject}
          onPreview={previewProject}
          lastBuild={saved.copiedProjects.length ? `${getProject(saved.lastProjectId).name} remix` : undefined}
        />
      )}

      {view === "learn" && (
        <Workbench
          key={project.id}
          project={project}
          files={files}
          completedSteps={completedSteps}
          onFilesChange={updateFiles}
          onCompleteStep={completeStep}
        />
      )}

      {view === "builds" && (
        <BuildsView
          projects={projects}
          copiedIds={saved.copiedProjects}
          onOpen={previewProject}
          onProjects={() => setView("projects")}
        />
      )}
    </div>
  );
}
