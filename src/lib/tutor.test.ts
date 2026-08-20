import { describe, expect, it } from "vitest";
import { cloneProjectFiles, projects } from "../data/projects";
import { getLocalTutorReply } from "./tutor";

const project = projects[0];

describe("built-in Clay tutor", () => {
  it("answers project questions without credentials", () => {
    const answer = getLocalTutorReply("question", "What is an h1?", {
      project,
      step: project.steps[1],
      activeFile: "index.html",
      files: cloneProjectFiles(project),
    });

    expect(answer).toContain("main heading");
    expect(answer).toContain("Preview");
  });

  it("compares layers without pasting a replacement solution", () => {
    const files = cloneProjectFiles(project);
    files["styles.css"] = files["styles.css"].replace("#2d7d50", "#a53f2b");
    const answer = getLocalTutorReply("compare", "", {
      project,
      step: project.steps[2],
      activeFile: "styles.css",
      files,
    });

    expect(answer).toContain("styles.css");
    expect(answer).toContain("presentation");
    expect(answer).not.toContain("#a53f2b");
  });
});
