import type { FileName, ProjectFiles, ProjectTemplate } from "../types";

const changed = (files: ProjectFiles, reference: ProjectFiles, file: FileName) =>
  files[file].trim() !== reference[file].trim();

const signalGardenFiles: ProjectFiles = {
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signal Garden</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="garden-card">
      <div class="plant" aria-hidden="true">🌿</div>
      <h1>Signal Garden</h1>
      <p id="status" class="status">Plant is healthy</p>
      <div class="details">
        <span>Last watered</span>
        <strong id="last-watered">Today</strong>
      </div>
      <button id="water-button">Water now</button>
    </main>
    <script src="script.js"></script>
  </body>
</html>`,
  "styles.css": `:root {
  --garden: #2d7d50;
  --paper: #ffffff;
  font-family: Inter, system-ui, sans-serif;
}

* { box-sizing: border-box; }

body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  color: #173324;
  background: #f2f7f3;
}

.garden-card {
  width: min(360px, calc(100vw - 40px));
  padding: 36px;
  text-align: center;
  background: var(--paper);
  border: 1px solid #d8e3db;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgb(31 74 48 / 12%);
}

.plant { font-size: 56px; }
h1 { margin: 12px 0 8px; }
.status { color: var(--garden); }

.details {
  display: flex;
  justify-content: space-between;
  margin: 28px 0;
  padding-top: 20px;
  border-top: 1px solid #d8e3db;
}

button {
  width: 100%;
  padding: 13px 18px;
  color: white;
  font: inherit;
  font-weight: 700;
  background: var(--garden);
  border: 0;
  border-radius: 9px;
  cursor: pointer;
}`,
  "script.js": `const button = document.querySelector("#water-button");
const status = document.querySelector("#status");
const lastWatered = document.querySelector("#last-watered");

button.addEventListener("click", () => {
  status.textContent = "Watering signal sent";
  lastWatered.textContent = "Just now";
  console.log("The button changed two text nodes.");
});`,
};

const calculatorFiles: ProjectFiles = {
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pocket Calculator</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="calculator">
      <h1>Pocket Calculator</h1>
      <output id="screen">0</output>
      <div class="keys">
        <button data-value="7">7</button><button data-value="8">8</button><button data-value="9">9</button>
        <button data-value="4">4</button><button data-value="5">5</button><button data-value="6">6</button>
        <button data-value="1">1</button><button data-value="2">2</button><button data-value="3">3</button>
        <button id="clear">C</button><button data-value="0">0</button><button id="double">×2</button>
      </div>
    </main>
    <script src="script.js"></script>
  </body>
</html>`,
  "styles.css": `* { box-sizing: border-box; }
body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: #eef1f4; font-family: Inter, system-ui, sans-serif; }
.calculator { width: 300px; padding: 24px; color: white; background: #20252c; border-radius: 18px; box-shadow: 0 20px 45px rgb(12 18 25 / 24%); }
h1 { margin: 0 0 20px; font-size: 18px; }
output { display: block; min-height: 74px; padding: 17px; text-align: right; font-size: 34px; color: #baf47c; background: #101419; border-radius: 10px; }
.keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
button { padding: 15px; color: white; font: inherit; border: 1px solid #4c555f; border-radius: 8px; background: #343b43; cursor: pointer; }
#double { color: #22160c; background: #ff9b45; border-color: #ff9b45; }`,
  "script.js": `const screen = document.querySelector("#screen");
let value = "";

document.querySelectorAll("[data-value]").forEach((button) => {
  button.addEventListener("click", () => {
    value += button.dataset.value;
    screen.textContent = value;
  });
});

document.querySelector("#clear").addEventListener("click", () => {
  value = "";
  screen.textContent = "0";
});

document.querySelector("#double").addEventListener("click", () => {
  value = String(Number(value || 0) * 2);
  screen.textContent = value;
  console.log("Doubled value:", value);
});`,
};

const weatherFiles: ProjectFiles = {
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Weather Card</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="weather-card">
      <p class="place">Olympia</p>
      <div class="weather-icon">⛅</div>
      <h1><span id="temperature">22</span>°</h1>
      <p id="summary">Soft clouds</p>
    </main>
    <script src="script.js"></script>
  </body>
</html>`,
  "styles.css": `body { min-height: 100vh; margin: 0; display: grid; place-items: center; color: #17314d; background: #e9f5ff; font-family: Inter, system-ui, sans-serif; }
.weather-card { width: 280px; padding: 32px; text-align: center; background: white; border: 1px solid #c9ddec; border-radius: 18px; box-shadow: 0 18px 45px rgb(28 72 109 / 13%); }
.place { text-transform: uppercase; letter-spacing: .12em; }
.weather-icon { font-size: 64px; }
h1 { margin: 12px 0; font-size: 56px; }`,
  "script.js": `const weather = { place: "Olympia", temperature: 22, summary: "Soft clouds" };
document.querySelector(".place").textContent = weather.place;
document.querySelector("#temperature").textContent = weather.temperature;
document.querySelector("#summary").textContent = weather.summary;
console.log("Rendered weather-shaped local data.");`,
};

export const projects: ProjectTemplate[] = [
  {
    id: "signal-garden",
    name: "Signal Garden",
    technologies: ["HTML", "CSS", "JavaScript"],
    level: "Beginner",
    description: "Read a small interface, change its words and colors, then wire its button.",
    longDescription: "Trace a visible garden card back through its three files, then change one thing at a time.",
    icon: "garden",
    copyable: true,
    files: signalGardenFiles,
    steps: [
      {
        id: 1,
        title: "Read the page",
        instruction: "Open each file. Notice that HTML names things, CSS styles them, and JavaScript changes them.",
        hint: "Start in index.html, then find the same class name in styles.css.",
        focusFile: "index.html",
        check: () => ({ pass: true, message: "You found the three jobs: structure, style, and behavior." }),
      },
      {
        id: 2,
        title: "Change the heading",
        instruction: "Find the <h1> heading. Replace its words, then run the project.",
        hint: "Search index.html for the text between <h1> and </h1>.",
        focusFile: "index.html",
        check: (files) => {
          const heading = files["index.html"].match(/<h1>(.*?)<\/h1>/s)?.[1]?.trim();
          return heading && heading !== "Signal Garden"
            ? { pass: true, message: `The preview now reads “${heading}”.` }
            : { pass: false, message: "The <h1> still says Signal Garden. Change only those words first." };
        },
      },
      {
        id: 3,
        title: "Style the card",
        instruction: "Change the --garden color in styles.css and run the project again.",
        hint: "The custom property is near the first line: --garden: #2d7d50.",
        focusFile: "styles.css",
        check: (files) => ({
          pass: !files["styles.css"].includes("--garden: #2d7d50"),
          message: !files["styles.css"].includes("--garden: #2d7d50")
            ? "One value changed every place that uses var(--garden)."
            : "The original garden color is still present. Replace its hex value.",
        }),
      },
      {
        id: 4,
        title: "Name the action",
        instruction: "Change the button words from Water now to an action of your choice.",
        hint: "The visible button words live in index.html, inside <button>.",
        focusFile: "index.html",
        check: (files) => ({
          pass: !files["index.html"].includes(">Water now</button>"),
          message: !files["index.html"].includes(">Water now</button>")
            ? "The button label changed without changing its id."
            : "Change the words Water now, but leave id=\"water-button\" intact.",
        }),
      },
      {
        id: 5,
        title: "Make it respond",
        instruction: "Change the status sentence that appears after a click, then run and click the button.",
        hint: "Look inside the addEventListener function in script.js.",
        focusFile: "script.js",
        check: (files) => ({
          pass: !files["script.js"].includes('status.textContent = "Watering signal sent"'),
          message: !files["script.js"].includes('status.textContent = "Watering signal sent"')
            ? "Your event handler now produces your own message."
            : "The click handler still uses the copied status message.",
        }),
      },
      {
        id: 6,
        title: "Explain what changed",
        instruction: "Ask Clay to compare versions. Then explain which file changed structure, style, or behavior.",
        hint: "HTML is structure, CSS is style, and JavaScript is behavior.",
        focusFile: "script.js",
        check: (files, reference) => ({
          pass: (Object.keys(files) as FileName[]).some((file) => changed(files, reference, file)),
          message: "Your workspace differs from the copied project. Use Compare versions to name the changed files.",
        }),
      },
    ],
  },
  {
    id: "pocket-calculator",
    name: "Pocket Calculator",
    technologies: ["JavaScript"],
    level: "Beginner",
    description: "Follow values from button click to calculation to screen.",
    longDescription: "See one value travel from a button, through JavaScript state, to a visible output.",
    icon: "calculator",
    copyable: true,
    files: calculatorFiles,
    steps: [
      {
        id: 1,
        title: "Trace one number",
        instruction: "Click 7. Find data-value=\"7\" in HTML, then find where JavaScript reads dataset.value.",
        hint: "The same value appears once as HTML data and once as JavaScript input.",
        focusFile: "script.js",
        check: () => ({ pass: true, message: "The value path is button → event → state → output." }),
      },
      {
        id: 2,
        title: "Change the operation",
        instruction: "Change the multiplier from 2 to 3 and rename the button ×3.",
        hint: "One change is in index.html and the other is inside the #double click handler.",
        focusFile: "script.js",
        check: (files) => ({
          pass: files["script.js"].includes("* 3") && files["index.html"].includes(">×3</button>"),
          message: files["script.js"].includes("* 3") && files["index.html"].includes(">×3</button>")
            ? "The label and calculation now agree."
            : "Make the visible label and the multiplication use the same number.",
        }),
      },
      {
        id: 3,
        title: "Recall the value path",
        instruction: "Without copying code, ask Clay why the screen changes after a click.",
        hint: "Name the event listener, value variable, and output element.",
        focusFile: "script.js",
        check: (files, reference) => ({
          pass: changed(files, reference, "script.js"),
          message: "You changed behavior. Explain the event → state → output chain.",
        }),
      },
    ],
  },
  {
    id: "weather-card",
    name: "Weather Card",
    technologies: ["HTML", "CSS", "API shape"],
    level: "Next",
    description: "Learn the shape of data before connecting a real service.",
    longDescription: "Render a local data object first; connect an external service only after its shape is understood.",
    icon: "weather",
    copyable: true,
    files: weatherFiles,
    steps: [
      {
        id: 1,
        title: "Preview the data shape",
        instruction: "Find the weather object and match each property to one visible element.",
        hint: "There are three properties and three querySelector assignments.",
        focusFile: "script.js",
        check: () => ({ pass: true, message: "The local object is a safe stand-in for a later API response." }),
      },
    ],
  },
];

export function cloneProjectFiles(project: ProjectTemplate): ProjectFiles {
  return { ...project.files };
}

export function getProject(projectId: string): ProjectTemplate {
  return projects.find((project) => project.id === projectId) ?? projects[0];
}
