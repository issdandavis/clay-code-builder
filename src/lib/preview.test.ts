import { describe, expect, it } from "vitest";
import { cloneProjectFiles, projects } from "../data/projects";
import { buildPreviewDocument, isPreviewMessage } from "./preview";

describe("preview sandbox document", () => {
  it("inlines local files, blocks network access, and removes source references", () => {
    const result = buildPreviewDocument(cloneProjectFiles(projects[0]));

    expect(result).toContain("Content-Security-Policy");
    expect(result).toContain("connect-src 'none'");
    expect(result).toContain(".garden-card");
    expect(result).toContain("querySelector");
    expect(result).not.toContain('href="styles.css"');
    expect(result).not.toContain('src="script.js"');
  });

  it("recognizes only the narrow console message contract", () => {
    expect(isPreviewMessage({ source: "clay-preview", level: "log", values: ["ready"] })).toBe(true);
    expect(isPreviewMessage({ source: "other", level: "log", values: ["ready"] })).toBe(false);
    expect(isPreviewMessage({ source: "clay-preview", level: "secret", values: [] })).toBe(false);
  });
});

