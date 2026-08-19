import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { generateProject } from "../scripts/generate-project.js";
import { checkProject } from "../scripts/check-project.js";

async function withTempProject(options, run) {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-check-"
    )
  );

  try {
    const result = await generateProject({
      cwd: tempDir,
      ...options
    });

    await run(result, tempDir);
  } finally {
    await fs.remove(tempDir);
  }
}

test("checkProject throws when there is no .blueprint.json", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-check-"
    )
  );

  try {
    await assert.rejects(
      () => checkProject({ cwd: tempDir }),
      /No \.blueprint\.json found/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("a freshly generated project is 0% ready with every document not started", async () => {
  await withTempProject(
    { projectName: "Fresh Project" },
    async (result) => {
      const report = await checkProject({ cwd: result.outputDir });

      assert.equal(report.summary.readiness, 0);
      assert.equal(report.summary.completeDocuments, 0);
      assert.equal(report.summary.unresolvedTodos, 0);
      assert.ok(report.summary.totalDocuments > 0);

      for (const category of report.categories) {
        for (const document of category.documents) {
          assert.equal(document.status, "not-started");
        }
      }
    }
  );
});

test("editing a document to remove all TODOs marks it complete", async () => {
  await withTempProject(
    { projectName: "Edited Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/00-product/PRODUCT_OVERVIEW.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          /TODO/g,
          "This is now filled in with real content."
        )
      );

      const report = await checkProject({ cwd: result.outputDir });

      const category = report.categories.find(
        (candidate) => candidate.key === "00-product"
      );

      const document = category.documents.find(
        (candidate) => candidate.file.endsWith("PRODUCT_OVERVIEW.md")
      );

      assert.equal(document.status, "complete");
      assert.equal(report.summary.completeDocuments, 1);
      assert.equal(report.summary.readiness > 0, true);
    }
  );
});

test("editing a document but leaving TODOs marks it as todo with a count", async () => {
  await withTempProject(
    { projectName: "Partial Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/00-product/MVP_SCOPE.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "What is the smallest version of the product that can validate the core hypothesis?",
          "Prove the core loop works end to end."
        )
      );

      const report = await checkProject({ cwd: result.outputDir });

      const category = report.categories.find(
        (candidate) => candidate.key === "00-product"
      );

      const document = category.documents.find(
        (candidate) => candidate.file.endsWith("MVP_SCOPE.md")
      );

      assert.equal(document.status, "todo");
      assert.ok(document.unresolvedCount > 0);
      assert.ok(report.summary.unresolvedTodos >= document.unresolvedCount);
    }
  );
});

test("blocker documents are only counted when AI/privacy modules are enabled", async () => {
  await withTempProject(
    { projectName: "No Modules Project" },
    async (result) => {
      const report = await checkProject({ cwd: result.outputDir });

      const blockerTitles = report.blockerDocuments.map(
        (document) => document.title
      );

      assert.ok(blockerTitles.includes("Security Baseline"));
      assert.ok(blockerTitles.includes("Threat Model"));
      assert.ok(blockerTitles.includes("Release Security Gate"));
      assert.ok(blockerTitles.includes("Release Quality Gate"));
      assert.equal(blockerTitles.includes("Privacy Model"), false);
      assert.equal(report.summary.blockers, blockerTitles.length);
    }
  );
});

test("privacy module adds Privacy Model as a blocker when incomplete", async () => {
  await withTempProject(
    { projectName: "Sensitive Project", sensitiveData: true },
    async (result) => {
      const report = await checkProject({ cwd: result.outputDir });

      const blockerTitles = report.blockerDocuments.map(
        (document) => document.title
      );

      assert.ok(blockerTitles.includes("Privacy Model"));
    }
  );
});

test("a blocker document no longer counts once it is completed", async () => {
  await withTempProject(
    { projectName: "Completed Security Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/08-security/SECURITY_BASELINE.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "- Never commit secrets.",
          "- Never commit secrets. Enforced via pre-commit hook and CI secret scanning."
        )
      );

      const report = await checkProject({ cwd: result.outputDir });

      const blockerTitles = report.blockerDocuments.map(
        (document) => document.title
      );

      assert.equal(blockerTitles.includes("Security Baseline"), false);
    }
  );
});

test("checklists are scored under their own category", async () => {
  await withTempProject(
    { projectName: "Checklist Category Project" },
    async (result) => {
      const report = await checkProject({ cwd: result.outputDir });

      const category = report.categories.find(
        (candidate) => candidate.label === "Checklists"
      );

      assert.ok(category);
      assert.equal(category.documents.length, 4);
    }
  );
});
