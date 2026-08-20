import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { generateProject } from "../scripts/generate-project.js";
import {
  complianceProject,
  SUPPORTED_STANDARDS
} from "../scripts/compliance-project.js";

async function withTempProject(options, run) {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-compliance-"
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

test("SUPPORTED_STANDARDS exposes iso27001 and gdpr", () => {
  assert.deepEqual(SUPPORTED_STANDARDS, ["iso27001", "gdpr"]);
});

test("complianceProject throws for an unsupported standard", async () => {
  await withTempProject({ projectName: "Bad Standard Project" }, async (result) => {
    await assert.rejects(
      () =>
        complianceProject({
          cwd: result.outputDir,
          standard: "hipaa"
        }),
      /Unknown standard/
    );
  });
});

test("complianceProject throws when there is no .blueprint.json", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-compliance-"
    )
  );

  try {
    await assert.rejects(
      () =>
        complianceProject({
          cwd: tempDir,
          standard: "iso27001"
        }),
      /No \.blueprint\.json found/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("a freshly generated project has 0% ISO 27001 coverage", async () => {
  await withTempProject({ projectName: "Fresh ISO Project" }, async (result) => {
    const report = await complianceProject({
      cwd: result.outputDir,
      standard: "iso27001"
    });

    assert.equal(report.summary.coverage, 0);

    for (const area of report.areas) {
      assert.equal(area.status, "not-started");
    }
  });
});

test("completing the mapped document marks the ISO 27001 area complete", async () => {
  await withTempProject({ projectName: "Threat Model ISO Project" }, async (result) => {
    const filePath = path.join(
      result.outputDir,
      "docs/08-security/THREAT_MODEL.md"
    );

    const original = await fs.readFile(filePath, "utf8");

    await fs.writeFile(
      filePath,
      original.replace(/TODO/g, "N/A — reviewed and documented.")
    );

    const report = await complianceProject({
      cwd: result.outputDir,
      standard: "iso27001"
    });

    const riskArea = report.areas.find(
      (area) => area.area === "Risk assessment"
    );

    assert.equal(riskArea.status, "complete");
    assert.ok(report.summary.coverage > 0);
  });
});

test("GDPR areas backed by PRIVACY_MODEL.md report no-document when the module is disabled", async () => {
  await withTempProject(
    { projectName: "No Privacy GDPR Project", sensitiveData: false, regulated: false },
    async (result) => {
      const report = await complianceProject({
        cwd: result.outputDir,
        standard: "gdpr"
      });

      const privacyAreas = report.areas.filter(
        (area) => area.file.includes("PRIVACY_MODEL")
      );

      assert.ok(privacyAreas.length > 0);

      for (const area of privacyAreas) {
        assert.equal(area.status, "no-document");
      }
    }
  );
});

test("filling in one PRIVACY_MODEL section marks only that GDPR area complete", async () => {
  await withTempProject(
    { projectName: "Partial Privacy GDPR Project", sensitiveData: true },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/09-privacy-governance/PRIVACY_MODEL.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "How are users informed about data use?",
          "Users are informed via the sign-up flow and a linked privacy notice."
        )
      );

      const report = await complianceProject({
        cwd: result.outputDir,
        standard: "gdpr"
      });

      const consentArea = report.areas.find(
        (area) => area.area === "Lawful basis and consent"
      );
      const minimisationArea = report.areas.find(
        (area) => area.area === "Data minimisation"
      );

      assert.equal(consentArea.status, "complete");
      assert.equal(minimisationArea.status, "not-started");
    }
  );
});

test("coverage percentage reflects the fraction of complete areas", async () => {
  await withTempProject({ projectName: "Coverage Math Project" }, async (result) => {
    const filePath = path.join(
      result.outputDir,
      "docs/08-security/THREAT_MODEL.md"
    );

    const original = await fs.readFile(filePath, "utf8");

    await fs.writeFile(
      filePath,
      original.replace(/TODO/g, "N/A — reviewed and documented.")
    );

    const report = await complianceProject({
      cwd: result.outputDir,
      standard: "iso27001"
    });

    const expected = Math.round(
      (report.summary.coveredAreas / report.summary.totalAreas) * 100
    );

    assert.equal(report.summary.coverage, expected);
    assert.equal(report.summary.coveredAreas, 1);
  });
});
