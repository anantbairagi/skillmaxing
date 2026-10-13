import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "AGENTS.md",
  "PRODUCT_HANDOFF.md",
  "README.md",
  "CLAUDE.md",
  ".env.example",
  ".cursor/rules/agents.mdc",
  ".github/CODEOWNERS",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/copilot-instructions.md",
  ".github/ISSUE_TEMPLATE/task.yml",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml",
  "docs/ARCHITECTURE.md",
  "docs/DEVELOPMENT.md",
  "docs/DEPLOYMENT.md",
  "docs/PROJECT_STATE.md",
  "docs/CHANGELOG.md",
  "docs/DECISIONS.md",
];

describe("handoff files", () => {
  for (const file of required) {
    it(`${file} exists`, () => {
      assert.equal(existsSync(join(root, file)), true, file);
    });
  }

  it("does not copy the local demo password into docs", () => {
    const banned = "study-local";
    const docs = [
      "PRODUCT_HANDOFF.md",
      "AGENTS.md",
      "README.md",
      "COVERAGE.md",
      "docs/DEVELOPMENT.md",
      "docs/PROJECT_STATE.md",
      "docs/DECISIONS.md",
      ".env.example",
    ];
    for (const file of docs) {
      const text = readFileSync(join(root, file), "utf8");
      assert.equal(text.includes(banned), false, file);
    }
  });

  it("resolves relative markdown links", () => {
    const markdown = required.filter((file) => file.endsWith(".md") || file.endsWith(".mdc"));
    const link = /\[[^\]]*\]\(([^)]+)\)/g;
    for (const file of markdown) {
      const text = readFileSync(join(root, file), "utf8");
      for (const match of text.matchAll(link)) {
        const href = match[1].split("#")[0].split("?")[0];
        if (!href || href.startsWith("http:") || href.startsWith("https:") || href.startsWith("mailto:")) continue;
        const target = normalize(join(root, dirname(file), href));
        assert.equal(existsSync(target), true, `${file} -> ${href}`);
      }
    }
  });
});
