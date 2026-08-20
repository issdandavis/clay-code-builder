# Clay Code Builder agent notes

- This is an original learning product. Do not copy Mimo branding, proprietary lesson text, or UI assets.
- Preserve the core mental model: **learn → write → see → ask**, with the console kept visibly separate.
- Browser code runs only in `iframe[sandbox="allow-scripts"]` with an in-document CSP. Never add
  `allow-same-origin` to the learner preview.
- The local tutor must remain useful without credentials. A configured Clay endpoint may extend it,
  but must not receive secrets or data outside the active project context.
- New lessons should follow **Watch → Copy → Change → Recall → Build** and provide replayable checks.
- Keep dependencies light. This project is intentionally Docker-free.

