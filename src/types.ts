export type FileName = "index.html" | "styles.css" | "script.js";

export type ProjectFiles = Record<FileName, string>;

export type StepCheck = {
  pass: boolean;
  message: string;
};

export type LessonStep = {
  id: number;
  title: string;
  instruction: string;
  hint: string;
  focusFile: FileName;
  check: (files: ProjectFiles, reference: ProjectFiles) => StepCheck;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  technologies: string[];
  level: "Beginner" | "Next";
  description: string;
  longDescription: string;
  icon: "garden" | "calculator" | "weather";
  copyable: boolean;
  files: ProjectFiles;
  steps: LessonStep[];
};

export type ConsoleEntry = {
  id: number;
  level: "info" | "log" | "warn" | "error" | "success";
  text: string;
};

export type TutorAction = "explain" | "hint" | "compare" | "question";

export type TutorContext = {
  project: ProjectTemplate;
  step: LessonStep;
  activeFile: FileName;
  files: ProjectFiles;
};

export type TutorMessage = {
  id: number;
  role: "clay" | "learner";
  text: string;
};

