import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { generateProject } from "../scripts/generate-project.js";
import { upgradeProject } from "../scripts/upgrade-project.js";

async function withTempProject(options, run) {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-upgrade-"
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

test("upgradeProject throws when there is no .blueprint.json", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-upgrade-"
    )
  );

  try {
    await assert.rejects(
      () => upgradeProject({ cwd: tempDir }),
      /No \.blueprint\.json found/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("a project generated at the current version is up to date", async () => {
  await withTempProject({ projectName: "Current Version Project" }, async (result) => {
    const report = await upgradeProject({ cwd: result.outputDir });

    assert.equal(report.upToDate, true);
    assert.deepEqual(report.changes, []);
    assert.equal(report.projectVersion, report.currentVersion);
  });
});

test("a project generated at an older version reports pending changes", async () => {
  await withTempProject({ projectName: "Older Version Project" }, async (result) => {
    const configPath = path.join(result.outputDir, ".blueprint.json");
    const config = await fs.readJson(configPath);

    config.blueprintVersion = "0.1.0";
    await fs.writeJson(configPath, config, { spaces: 2 });

    const report = await upgradeProject({ cwd: result.outputDir });

    assert.equal(report.upToDate, false);
    assert.ok(report.changes.length > 0);
    assert.equal(
      report.changes[0].file,
      "docs/05-architecture/SYSTEM_ARCHITECTURE.md"
    );
    assert.equal(report.changes[0].version, "0.3.1");
  });
});

test("a project generated after a change ships does not see it again", async () => {
  await withTempProject({ projectName: "Post Change Project" }, async (result) => {
    const configPath = path.join(result.outputDir, ".blueprint.json");
    const config = await fs.readJson(configPath);

    config.blueprintVersion = "0.4.0";
    await fs.writeJson(configPath, config, { spaces: 2 });

    const report = await upgradeProject({ cwd: result.outputDir });

    assert.equal(report.upToDate, true);
    assert.deepEqual(report.changes, []);
  });
});

test("changes are reported in ascending version order", async () => {
  await withTempProject({ projectName: "Order Project" }, async (result) => {
    const configPath = path.join(result.outputDir, ".blueprint.json");
    const config = await fs.readJson(configPath);

    config.blueprintVersion = "0.0.1";
    await fs.writeJson(configPath, config, { spaces: 2 });

    const report = await upgradeProject({ cwd: result.outputDir });

    const versions = report.changes.map((change) => change.version);
    const sorted = [...versions].sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
      const [bMajor, bMinor, bPatch] = b.split(".").map(Number);

      return aMajor - bMajor || aMinor - bMinor || aPatch - bPatch;
    });

    assert.deepEqual(versions, sorted);
  });
});
