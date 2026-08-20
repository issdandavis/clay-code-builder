// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildTutorPrompt, chooseClayModel, validateTutorPayload } from "./clayGateway";

const request = {
  action: "hint",
  question: "",
  context: {
    project: "Signal Garden",
    step: "Change the heading",
    instruction: "Change only the heading words.",
    activeFile: "index.html",
    activeCode: "<h1>Signal Garden</h1>",
  },
};

describe("Clay gateway boundary", () => {
  it("prefers Clay, then a coding model, then the installed voice carrier", () => {
    expect(chooseClayModel(["issac-voice-chatml:latest", "clay:latest"])).toBe("clay:latest");
    expect(chooseClayModel(["issac-voice-chatml:latest", "qwen2.5-coder:3b"])).toBe("qwen2.5-coder:3b");
    expect(chooseClayModel(["issac-voice-chatml:latest"])).toBe("issac-voice-chatml:latest");
  });

  it("accepts only bounded project context", () => {
    expect(validateTutorPayload(request).context.activeFile).toBe("index.html");
    expect(() => validateTutorPayload({ ...request, action: "shell" })).toThrow("action must be");
    expect(() => validateTutorPayload({
      ...request,
      context: { ...request.context, activeCode: "x".repeat(12_001) },
    })).toThrow("exceeds 12000");
  });

  it("marks learner code as untrusted and preserves the hint boundary", () => {
    const prompt = buildTutorPrompt(validateTutorPayload(request));
    expect(prompt).toContain("untrusted lesson material");
    expect(prompt).toContain("Give exactly one directional hint");
    expect(prompt).toContain("<active-code>");
    expect(prompt).toContain("Do not emit tool calls");
  });
});
