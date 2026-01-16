import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf-8");
}

const TYPE_DECLARATION_PATTERN = /(?:type|interface)\s+InterruptionLog\b/;
const IMPORT_PATTERN =
  /import\s+type\s+{[^}]*\bInterruptionLog\b[^}]*}\s+from\s+"..\/lib\/models";/;

describe("InterruptionLog 类型引用", () => {
  test("timer/page.tsx 使用 models.ts 中的 InterruptionLog", () => {
    const content = readSource("app/timer/page.tsx");
    expect(content).toMatch(IMPORT_PATTERN);
    expect(content).not.toMatch(TYPE_DECLARATION_PATTERN);
  });

  test("pause-analysis/page.tsx 使用 models.ts 中的 InterruptionLog", () => {
    const content = readSource("app/pause-analysis/page.tsx");
    expect(content).toMatch(IMPORT_PATTERN);
    expect(content).not.toMatch(TYPE_DECLARATION_PATTERN);
  });
});
