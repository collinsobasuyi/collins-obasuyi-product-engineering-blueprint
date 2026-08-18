import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "path";
import os from "os";

import {
  createSlug,
  generateProject
} from "../scripts/generate-project.js";

test("createSlug converts project names safely", () => {
  assert.equal(
    createSlug("My Healthy Shop"),
    "my-healthy-shop"
  );

  assert.equal(
    createSlug("AI!!! Planner"),
    "ai-planner"
  );

  assert.equal(
    createSlug("  Test Product  "),
    "test-product"
  );
});

test("generates a simple project with baseline documentation", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    const result = await generateProject({
      projectName: "Simple Test App",
      cwd: tempDir
    });

    assert.equal(
      result.slug,
      "simple-test-app"
    );

    const projectDir = path.join(
      tempDir,
      "simple-test-app"
    );

    assert.equal(
      await fs.pathExists(
        path.join(
          projectDir,
          ".blueprint.json"
        )
      ),
      true
    );

    assert.equal(
      await fs.pathExists(
        path.join(
          projectDir,
          "AGENTS.md"
        )
      ),
      true
    );

    assert.equal(
      await fs.pathExists(
        path.join(
          projectDir,
          "docs/00-product/PRODUCT_OVERVIEW.md"
        )
      ),
      true
    );

    assert.equal(
      await fs.pathExists(
        path.join(
          projectDir,
          "docs/08-security/SECURITY_BASELINE.md"
        )
      ),
      true
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("generates top-level operational checklists", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    await generateProject({
      projectName: "Checklist Test",
      cwd: tempDir
    });

    const checklistsDir = path.join(
      tempDir,
      "checklist-test",
      "checklists"
    );

    for (const file of [
      "project-start.md",
      "feature-ready.md",
      "pre-release.md",
      "production-readiness.md"
    ]) {
      assert.equal(
        await fs.pathExists(
          path.join(checklistsDir, file)
        ),
        true
      );
    }
  } finally {
    await fs.remove(tempDir);
  }
});

test("generates AI documentation only when AI is enabled", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    await generateProject({
      projectName: "AI Test",
      isAI: true,
      cwd: tempDir
    });

    const projectDir = path.join(
      tempDir,
      "ai-test"
    );

    assert.equal(
      await fs.pathExists(
        path.join(
          projectDir,
          "docs/06-ai/AI_ARCHITECTURE.md"
        )
      ),
      true
    );

    assert.equal(
      await fs.pathExists(
        path.join(
          projectDir,
          "docs/06-ai/AI_GUARDRAILS.md"
        )
      ),
      true
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("does not generate AI documentation when AI is disabled", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    await generateProject({
      projectName: "No AI Test",
      isAI: false,
      cwd: tempDir
    });

    const aiDir = path.join(
      tempDir,
      "no-ai-test",
      "docs/06-ai"
    );

    assert.equal(
      await fs.pathExists(aiDir),
      false
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("generates privacy documentation for sensitive data projects", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    await generateProject({
      projectName: "Health App",
      sensitiveData: true,
      cwd: tempDir
    });

    assert.equal(
      await fs.pathExists(
        path.join(
          tempDir,
          "health-app",
          "docs/09-privacy-governance/PRIVACY_MODEL.md"
        )
      ),
      true
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("generates accessibility evidence directory for mobile projects", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    await generateProject({
      projectName: "Mobile App",
      mobile: true,
      cwd: tempDir
    });

    assert.equal(
      await fs.pathExists(
        path.join(
          tempDir,
          "mobile-app",
          "docs/15-evidence/accessibility"
        )
      ),
      true
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("refuses to overwrite an existing project directory", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    const existing = path.join(
      tempDir,
      "existing-project"
    );

    await fs.ensureDir(existing);

    await assert.rejects(
      () =>
        generateProject({
          projectName: "Existing Project",
          cwd: tempDir
        }),
      /already exists/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("replaces template placeholders in generated files", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-"
    )
  );

  try {
    await generateProject({
      projectName: "Placeholder Test",
      cwd: tempDir
    });

    const agentsPath = path.join(
      tempDir,
      "placeholder-test",
      "AGENTS.md"
    );

    const content = await fs.readFile(
      agentsPath,
      "utf8"
    );

    assert.match(
      content,
      /Placeholder Test/
    );

    assert.equal(
      content.includes("{{PROJECT_NAME}}"),
      false
    );
  } finally {
    await fs.remove(tempDir);
  }
});
