"""Parse and lower one six-tongue expression without executing learner code."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def main() -> int:
    root = Path(os.environ.get("CLAY_TONGUE_COMPILER", r"C:\dev\tongue-compiler"))
    if not (root / "tonguec.py").is_file():
        print(json.dumps({"ok": False, "error": "Six-tongue compiler is unavailable."}))
        return 2

    sys.path.insert(0, str(root))
    try:
        import tonguec  # type: ignore

        source = sys.stdin.read()
        ir, arguments = tonguec.lower(tonguec.parse(tonguec.lex(source)))
        rendered = " ".join(
            op[0] + (" " + str(op[1]) if len(op) > 1 else "") for op in ir
        )
        result = {
            "ok": True,
            "ir": rendered,
            "arguments": arguments,
            "python": tonguec.emit(ir, arguments, "python"),
            "javascript": tonguec.emit(ir, arguments, "javascript"),
        }
        print(json.dumps(result))
        return 0
    except Exception as error:
        print(json.dumps({"ok": False, "error": f"{type(error).__name__}: {error}"}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
