"""Build the small development APK with the already-installed Android SDK."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent
SDK = Path("C:/dev/tools/android-mla")
TOOLS = SDK / "build-tools/35.0.0"
ANDROID = SDK / "platforms/android-35/android.jar"
JDK = Path("C:/Users/issda/.jdks/jdk-24.0.2")
OUT = ROOT / "build"


def run(*args: object) -> str:
    completed = subprocess.run(
        [str(arg) for arg in args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=0x08000000,
        timeout=120,
    )
    if completed.returncode:
        raise RuntimeError((completed.stdout + "\n" + completed.stderr).strip())
    return completed.stdout


def source_hashes() -> dict[str, str]:
    return {
        str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted((ROOT / "android").rglob("*"))
        if path.is_file()
    }


def main() -> None:
    OUT.mkdir(exist_ok=True)
    before = source_hashes()
    with tempfile.TemporaryDirectory(prefix="clay-compiler-", dir=OUT) as raw_temp:
        temp = Path(raw_temp)
        for name in ("classes", "dex", "gen"):
            (temp / name).mkdir()

        run(TOOLS / "aapt2.exe", "compile", "--dir", ROOT / "android/res", "-o", temp / "res.zip")
        run(
            TOOLS / "aapt2.exe", "link",
            "--manifest", ROOT / "android/AndroidManifest.xml",
            "-I", ANDROID,
            "--auto-add-overlay",
            "--java", temp / "gen",
            "-R", temp / "res.zip",
            "-o", temp / "unsigned.apk",
        )
        generated = list((temp / "gen").rglob("*.java"))
        run(
            JDK / "bin/javac.exe", "--release", "8", "-encoding", "UTF-8",
            "-classpath", ANDROID,
            "-d", temp / "classes",
            ROOT / "android/MainActivity.java",
            *generated,
        )
        classes = list((temp / "classes").rglob("*.class"))
        run(
            JDK / "bin/java.exe", "-Xmx256m", "-cp", TOOLS / "lib/d8.jar",
            "com.android.tools.r8.D8", "--min-api", "26", "--lib", ANDROID,
            "--output", temp / "dex", *classes,
        )
        with zipfile.ZipFile(temp / "unsigned.apk", "a", zipfile.ZIP_DEFLATED) as archive:
            for dex in (temp / "dex").glob("*.dex"):
                archive.write(dex, dex.name)
        run(TOOLS / "zipalign.exe", "-f", "4", temp / "unsigned.apk", temp / "aligned.apk")
        signed = temp / "ClayCompiler.apk"
        keystore = Path.home() / ".android/parcel-study-development.keystore"
        run(
            JDK / "bin/java.exe", "-jar", TOOLS / "lib/apksigner.jar", "sign",
            "--ks", keystore, "--ks-pass", "pass:android", "--key-pass", "pass:android",
            "--out", signed, temp / "aligned.apk",
        )
        verification = run(JDK / "bin/java.exe", "-jar", TOOLS / "lib/apksigner.jar", "verify", "--verbose", signed)
        if source_hashes() != before:
            raise RuntimeError("Android source changed during build")
        apk = signed.read_bytes()
        destination = OUT / "ClayCompiler.apk"
        destination.write_bytes(apk)
        receipt = {
            "package": "com.aethermoore.claycompiler",
            "version": "0.1.0",
            "version_code": 1,
            "development": True,
            "store_ready": False,
            "target_sdk": 35,
            "bytes": len(apk),
            "sha256": hashlib.sha256(apk).hexdigest(),
            "source_hashes": before,
            "signature_verified": "Verified" in verification or not verification.strip(),
        }
        (OUT / "android-receipt.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")
        print(json.dumps({key: value for key, value in receipt.items() if key != "source_hashes"}, indent=2))


if __name__ == "__main__":
    main()
