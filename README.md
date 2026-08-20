# Clay Code Builder

An original, lightweight coding tutor that teaches the shape of a real project:

**instructions → files → code → preview → console → questions**

The first release includes three copyable projects, a live HTML/CSS/JavaScript workbench, local
progress, step checks, and the **Ask Clay** project-aware tutor. It runs without Docker.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## What works now

- Browse finished projects and copy one into your workspace.
- Edit `index.html`, `styles.css`, and `script.js` with CodeMirror.
- Run the result in a network-blocked, sandboxed iframe.
- See preview logs and runtime errors in a separate console.
- Follow step-by-step goals and keep progress in `localStorage`.
- Ask Clay to explain the active file, give one hint, compare versions, or answer common project
  questions.
- Optionally connect a local Clay-compatible tutor endpoint with `VITE_CLAY_API_URL`.

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

MIT © Issac Davis
