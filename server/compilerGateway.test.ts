import { describe, expect, it } from "vitest";
import {
  checkSource,
  compilerHealth,
  validateCompilerPayload,
} from "./compilerGateway";

describe("compiler payload", () => {
  it("accepts only bounded named language profiles", () => {
    expect(validateCompilerPayload({ language: "python", source: "print('ok')" })).toEqual({
      language: "python",
      source: "print('ok')",
    });
    expect(() => validateCompilerPayload({ language: "shell", source: "whoami" })).toThrow(/language must/);
    expect(() => validateCompilerPayload({ language: "python", source: "" })).toThrow(/source is required/);
    expect(() => validateCompilerPayload({ language: "python", source: "x".repeat(32_001) })).toThrow(/exceeds/);
  });
});

describe("real compiler checks", () => {
  it("checks Python without executing it", async () => {
    const valid = await checkSource({ language: "python", source: "raise RuntimeError('must not run')\n" });
    const invalid = await checkSource({ language: "python", source: "def broken(:\n    pass\n" });
    expect(valid.ok).toBe(true);
    expect(invalid.ok).toBe(false);
    expect(invalid.diagnostics).toMatch(/SyntaxError/);
  });

  it("checks JavaScript without executing it", async () => {
    const valid = await checkSource({ language: "javascript", source: "throw new Error('must not run');\n" });
    const invalid = await checkSource({ language: "javascript", source: "function broken( {\n" });
    expect(valid.ok).toBe(true);
    expect(invalid.ok).toBe(false);
    expect(invalid.diagnostics).toMatch(/SyntaxError/);
  });

  it("checks the canonical six-tongue expression grammar and exposes its IR", async () => {
    const valid = await checkSource({ language: "six-tongue", source: "(a sai 2) tuu (b nok 1)" });
    const invalid = await checkSource({ language: "six-tongue", source: "a nonsense b" });
    expect(valid.ok).toBe(true);
    expect(valid.artifact?.ir).toBe("LOAD a CONST 2 ADD LOAD b CONST 1 SUB MUL");
    expect(valid.artifact?.arguments).toEqual(["a", "b"]);
    expect(invalid.ok).toBe(false);
  });

  it("checks Java and C++ with the installed local toolchains", async () => {
    const health = compilerHealth();
    expect(health.java).toBe(true);
    expect(health.cpp).toBe(true);
    const java = await checkSource({
      language: "java",
      source: "public class Main { public static void main(String[] args) { System.out.println(\"ok\"); } }",
    });
    const cpp = await checkSource({
      language: "cpp",
      source: "#include <iostream>\nint main(){ std::cout << \"ok\"; return 0; }",
    });
    const badJava = await checkSource({
      language: "java",
      source: "public class Main { public static void main(String[] args) { int value = ; } }",
    });
    const badCpp = await checkSource({ language: "cpp", source: "int main( { return 0; }" });
    expect(java.ok, java.diagnostics).toBe(true);
    expect(cpp.ok, cpp.diagnostics).toBe(true);
    expect(badJava.ok).toBe(false);
    expect(badJava.diagnostics.length).toBeGreaterThan(0);
    expect(badCpp.ok).toBe(false);
    expect(badCpp.diagnostics.length).toBeGreaterThan(0);
  }, 30_000);

  it("keeps the C++ preprocessor from reading arbitrary PC paths", async () => {
    await expect(checkSource({ language: "cpp", source: '#include "C:/Users/issda/private.txt"\nint main(){}' }))
      .rejects.toThrow(/literal standard-library headers/);
    await expect(checkSource({ language: "cpp", source: '#define TARGET "C:/Users/issda/private.txt"\n#include TARGET\nint main(){}' }))
      .rejects.toThrow(/literal standard-library headers/);
    await expect(checkSource({ language: "cpp", source: '#if __has_include("C:/Users/issda/private.txt")\n#endif\nint main(){}' }))
      .rejects.toThrow(/probes and aliases/);
  });
});
