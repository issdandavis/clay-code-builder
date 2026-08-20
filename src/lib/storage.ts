import type { ProjectFiles } from "../types";

const STORAGE_KEY = "clay-code-builder.v1";

export type SavedState = {
  workspaces: Record<string, ProjectFiles>;
  completedSteps: Record<string, number[]>;
  copiedProjects: string[];
  lastProjectId: string;
};

export const emptyState: SavedState = {
  workspaces: {},
  completedSteps: {},
  copiedProjects: [],
  lastProjectId: "signal-garden",
};

export function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(emptyState);
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    return {
      workspaces: parsed.workspaces ?? {},
      completedSteps: parsed.completedSteps ?? {},
      copiedProjects: parsed.copiedProjects ?? [],
      lastProjectId: parsed.lastProjectId ?? "signal-garden",
    };
  } catch {
    return structuredClone(emptyState);
  }
}

export function saveState(state: SavedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

