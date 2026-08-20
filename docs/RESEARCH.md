# Product and learning research

Research date: 2026-08-19. This is a design record, not copied course content.

## What the current Mimo product demonstrates

Mimo currently presents one connected loop: structured paths, short interactive practice, real
projects, an in-app editor, immediate results, progress tracking, and AI guidance. Its public
product copy emphasizes that the learner should stay in control of the code while AI explains,
debugs, and compares rather than silently replacing the learner.

Sources:

- [Mimo product page](https://mimo.org/) — step-by-step guidance, targeted practice, real projects,
  and AI-powered hints.
- [Mimo App Store listing](https://apps.apple.com/us/app/mimo-learn-coding-programming/id1133960732)
  — mobile IDE, project file editing, live output, guided paths, and portfolio projects.
- [Mimo learning-path design](https://mimo.org/blog/meet-your-new-learning-path) — interleaving new
  concepts with repeated practice rather than completing a whole topic once and leaving it.
- [Mimo on AI for learners](https://mimo.org/blog/should-you-use-ai-to-learn-to-code) — write first;
  use AI to explain, debug, and compare.

Clay Code Builder borrows that *workflow category*, not Mimo's branding, interface, assets, or
proprietary lesson content.

## Learning sequence used here

**Watch → Copy → Change → Recall → Build**

1. **Watch:** open a finished result and trace one visible result back to a file and line.
2. **Copy:** copy the complete working project into a private local workspace.
3. **Change:** edit one constrained target and immediately run it.
4. **Recall:** explain the changed line or recreate a small fragment without looking.
5. **Build:** start from a thinner scaffold, then eventually from an empty project.

Why:

- Retrieval practice produced stronger meaningful learning than elaborative concept mapping in the
  Karpicke and Blunt experiment: [Science paper record](https://pubmed.ncbi.nlm.nih.gov/21252317/).
- Faded Parsons problems move learners from rearranging and completing working code toward writing
  it themselves. The 2026 Berkeley report describes their use in scalable mastery-based software
  engineering instruction: [UCB/EECS-2026-183](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2026/EECS-2026-183.html).
- A review of worked examples in programming identifies code tracing, subgoal structure, and
  incomplete examples as established scaffolds while noting open research gaps:
  [ACM TOCE review record](https://eric.ed.gov/?id=EJ1381113).

## Agent behavior

The sidebar has a hint ladder:

1. explain the active file or selected concept;
2. give one directional hint;
3. compare the learner version with the copied working version;
4. reveal code only when explicitly requested in a later course mode.

The shipped local engine handles the included projects without credentials. `VITE_CLAY_API_URL`
may point at a local Clay-compatible endpoint for broader questions. Only the active project name,
step, filename, code, and question are sent.

## Lightweight execution and security

HTML, CSS, and JavaScript run in the browser, so Docker is not required. The preview uses a
sandboxed `srcdoc` iframe without `allow-same-origin` and adds a restrictive CSP. MDN warns that
unsandboxed `srcdoc` is an injection surface and specifically recommends sandboxing when the frame
does not need parent-document access:
[MDN `srcdoc` security considerations](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/srcdoc#security_considerations).

The first release intentionally does not execute Python. A later Python lane should use a dedicated
worker/runtime with explicit resource ceilings rather than adding local Docker to this app.

