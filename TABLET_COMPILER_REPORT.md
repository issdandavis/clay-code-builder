# Tablet compiler build report — 2026-10-16

## Outcome

`Clay Compiler` 0.1.0 is installed on the Samsung SM-X230 (`R5GL40NM19K`) as
`com.aethermoore.claycompiler`. It opens directly into the Compiler Lab and checks Python,
JavaScript, C++, Java, and Six-Tongues source through the PC's installed toolchains.

The APK is a 12.5 KiB development launcher. Its final SHA-256 is recorded in
`build/android-receipt.json`. The PC service runs under `pythonw.exe` and
`C:\dev\pc-health\run_headless.py`, with streams redirected to a bounded log. It listens only on
PC loopback (`127.0.0.1:5174`); ADB maps the tablet's same loopback port to it.

## What was reused

- `C:\dev\clay-code-builder`: the cleanest existing learn → write → see → ask product, with a
  responsive CodeMirror workbench and local progress.
- `C:\dev\tongue-compiler\tonguec.py`: the canonical Six-Tongues lexer, parser, lowerer, and
  emitters. The tablet project contains no copied grammar or opcode table.
- Installed Python, Node, Microsoft Build Tools, and JDK toolchains.
- `C:\dev\pc-health\run_headless.py`: the profile-standard no-window process launcher.

The open Cxxdroid screen was used as a reference for the useful interaction pattern: a large
editor, explicit language/tool state, one primary check action, and a touch symbol strip. Its
branding, assets, lesson text, and implementation were not copied. The older compiler lane,
AetherDesk AI-IDE surfaces, and Kimi folders were inventoried but were either less complete or too
broad for this focused tablet tool.

## Verification

| Check | Result |
|---|---|
| Vitest | 4 files, 13/13 tests passed |
| Production build | TypeScript + Vite passed |
| Python helper compilation | passed |
| Android build/signature | aapt2, javac, D8, zipalign, apksigner passed |
| APK install | streamed install succeeded |
| Installed package/version | `com.aethermoore.claycompiler`, 0.1.0 (code 1) |
| PC bind | `127.0.0.1:5174` only |
| Python on tablet | passed with `py_compile` |
| JavaScript on tablet | passed with `node --check` |
| C++ on tablet | passed with MSVC `/Zs` |
| Java on tablet | passed with `javac` |
| Six Tongues on tablet | passed; expected `LOAD a CONST 2 ADD ...` IR observed |
| Learner source execution | disabled |

The automated tests also feed invalid source to every profile and verify rejection. Separate
Python and JavaScript cases contain code that would raise/throw if executed; checks reject or
accept syntax without triggering those statements.

The C++ regression suite also rejects absolute, quoted, macro-expanded, aliased, and probed include
paths. That closes the preprocessor file-read path while retaining normal standard headers such as
`<iostream>`.

## Evidence

- `evidence/tablet-20261016/installed-app-final/screen.png`: final inset-safe app surface.
- `evidence/tablet-20261016/installed-app-final/six-tongues-pass.png`: final installed APK with a
  successful Six-Tongues check.
- `evidence/tablet-20261016/installed-python-pass/`: Python result from the installed shell.
- `evidence/tablet-20261016/installed-cpp-pass/`: C++ result from the installed shell.
- `evidence/tablet-20261016/installed-java-pass/`: Java result from the installed shell.
- `evidence/tablet-20261016/installed-six-tongues-pass/`: Six-Tongues result and UI tree.

## Current boundary

This release checks whether code would compile; it does not run it. It also depends on the PC and
USB debugging connection. That matches the requested verification-first learning use and avoids
shipping several large, stale toolchains inside the APK. A later execution mode should use a
separate capability, explicit learner action, strict resource limits, and a reviewed sandbox.
