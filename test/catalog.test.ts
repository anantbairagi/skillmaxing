import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../data/catalog.json", import.meta.url), "utf8"));

describe("catalog", () => {
  it("matches the reference course sizes", () => {
    const count = (id: string) => catalog.courses.find((course: { id: string; modules: { lessons: unknown[] }[] }) => course.id === id)
      .modules.reduce((sum: number, mod: { lessons: unknown[] }) => sum + mod.lessons.length, 0);
    assert.equal(count("python-ai"), 86);
    assert.equal(count("inference-eng"), 40);
    assert.equal(count("system"), 217);
    assert.equal(catalog.papers.length, 36);
    assert.equal(catalog.posts.length, 4);
  });

  it("keeps slugs unique inside each course", () => {
    for (const course of catalog.courses) {
      const slugs = course.modules.flatMap((mod: { lessons: { slug: string }[] }) => mod.lessons.map((lesson) => lesson.slug));
      assert.equal(new Set(slugs).size, slugs.length);
    }
  });
});
