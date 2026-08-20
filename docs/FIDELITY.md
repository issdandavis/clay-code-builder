# Concept-to-browser fidelity record

QA date: 2026-08-19. The in-app browser connection was unavailable after reconnection, so the
installed local Chrome was used headlessly through Selenium. No Docker image or browser download
was needed.

| Design point | Concept | Verified implementation |
|---|---|---|
| Learning path | Numbered steps on the left | Six project steps, completed states, and selected-step state |
| Editing surface | Files beside a dark code editor | Three real files beside CodeMirror with HTML/CSS/JS modes |
| Cause and effect | Preview immediately beside code | Sandboxed iframe beside the editor; run checks rebuild it |
| Debugging | Console below the work surface | Preview logs and runtime errors cross a validated message bridge |
| Help | Persistent Ask Clay rail | Context-aware local tutor with explain, hint, compare, and questions |
| Visual language | White canvas, ink type, clay-orange actions, green output | Same hierarchy, palette, borders, and reserved orange emphasis |

The first browser pass exposed two real CSS defects: the preview occupied the one-pixel divider
column, and CodeMirror could overflow across the preview. Both were fixed before the final capture.

Functional browser checks passed for:

- project copy and workspace opening;
- editing the heading and passing its lesson check;
- running the preview button and receiving its console message;
- asking Clay what an `h1` is and receiving a project-aware answer;
- iframe sandbox remaining exactly `allow-scripts`;
- 390-pixel mobile layout with no horizontal page overflow.
