# Clay Code Builder

An original, lightweight coding tutor that teaches the shape of a real project:

**instructions → files → code → preview → console → questions**

The first release includes three copyable projects, a live HTML/CSS/JavaScript workbench, local
progress, step checks, and the **Ask Clay** project-aware tutor. It runs without Docker.

The tablet **Clay Compiler Lab** adds syntax/structure checks for Python, JavaScript, C++, Java,
and the canonical Six-Tongues compiler. Checks run in disposable PC workspaces and never execute
learner source. See [SYSTEM_MAP.md](SYSTEM_MAP.md) for the exact path and trust boundaries.
The first installed-device results are in [TABLET_COMPILER_REPORT.md](TABLET_COMPILER_REPORT.md).

## Run it

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

The development server discovers `../loom/clay_ask.py`, selects the installed `clay` model when
available, and otherwise uses the best installed local coding/voice carrier. The subprocess is
headless, limited to 45 seconds by default, and receives only the active project, lesson, file, and
at most 12,000 characters of active code. See `.env.example` for overrides.

## What works now

- Browse finished projects and copy one into your workspace.
- Edit `index.html`, `styles.css`, and `script.js` with CodeMirror.
- Run the result in a network-blocked, sandboxed iframe.
- See preview logs and runtime errors in a separate console.
- Follow step-by-step goals and keep progress in `localStorage`.
- Ask Clay to explain the active file, give one hint, compare versions, or answer common project
  questions.
- Ask the real local Loom/Clay bridge automatically during `npm run dev`; if Clay or Ollama is
  unavailable, fall back to the built-in project tutor without losing the learner's question.

## Teaching model

`Watch → Copy → Change → Recall → Build`

See [docs/RESEARCH.md](docs/RESEARCH.md) for the product research, instructional rationale, and
security decision record.

## Visual specification

- [Workbench concept](design/workbench-concept.png)
- [Projects concept](design/projects-concept.png)
- [Verified workbench implementation](design/workbench-implementation.png)
- [Verified mobile implementation](design/mobile-implementation.png)

The concept-to-browser comparison is recorded in [docs/FIDELITY.md](docs/FIDELITY.md).

## Checks

```bash
npm test
npm run build
```

## Connected tablet

Build the development launcher with `python -B build_android.py`, install `build/ClayCompiler.apk`,
then run `ops/connect-tablet.ps1`. The script starts the service through the profile's headless
launcher and creates the ADB loopback. No server terminal window is opened.

MIT © Issac Davis
