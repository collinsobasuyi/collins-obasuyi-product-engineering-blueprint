import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { generateProject } from "../scripts/generate-project.js";
import { reviewProject } from "../scripts/review-project.js";

async function withTempProject(options, run) {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-review-"
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

test("reviewProject throws when there is no .blueprint.json", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-review-"
    )
  );

  try {
    await assert.rejects(
      () => reviewProject({ cwd: tempDir }),
      /No \.blueprint\.json found/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("a freshly generated project has zero findings", async () => {
  await withTempProject(
    { projectName: "Fresh Review Project" },
    async (result) => {
      const report = await reviewProject({ cwd: result.outputDir });

      assert.equal(report.summary.totalFindings, 0);
      assert.deepEqual(report.findings, []);
    }
  );
});

test("an FR block that is started but missing linkage fields is flagged", async () => {
  await withTempProject(
    { projectName: "FR Linkage Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "**The system shall:** TODO",
          "**The system shall:** Allow a user to reset their password."
        )
      );

      const report = await reviewProject({ cwd: result.outputDir });

      const messages = report.findings.map((finding) => finding.message);

      assert.ok(
        messages.includes("FR-001 has no linked product requirement.")
      );
      assert.ok(
        messages.includes("FR-001 has no linked acceptance criteria.")
      );
      assert.ok(
        report.findings.every(
          (finding) => finding.category === "traceability"
        )
      );
    }
  );
});

test("an FR block is not flagged once its linkage fields are filled in", async () => {
  await withTempProject(
    { projectName: "FR Complete Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      const edited = original
        .replace(
          "**The system shall:** TODO",
          "**The system shall:** Allow a user to reset their password."
        )
        .replace(
          "**Related product requirement:** TODO",
          "**Related product requirement:** PR-001"
        )
        .replace(
          "**Acceptance criteria:** TODO",
          "**Acceptance criteria:** AC-001"
        );

      await fs.writeFile(filePath, edited);

      const report = await reviewProject({ cwd: result.outputDir });

      assert.equal(report.summary.totalFindings, 0);
    }
  );
});

test("a threat missing a mitigation is flagged once the threat is started", async () => {
  await withTempProject(
    { projectName: "Threat Mitigation Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/08-security/THREAT_MODEL.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "**Threat:** TODO",
          "**Threat:** Credential stuffing against the login endpoint."
        )
      );

      const report = await reviewProject({ cwd: result.outputDir });

      const messages = report.findings.map((finding) => finding.message);

      assert.ok(messages.includes("TM-001 has no documented mitigation."));
    }
  );
});

test("sensitive-data keywords are flagged when sensitiveData and regulated are both false", async () => {
  await withTempProject(
    {
      projectName: "Sensitive Keyword Project",
      sensitiveData: false,
      regulated: false
    },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/07-data/USER_DATA.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "## Data collected\n\nTODO",
          "## Data collected\n\nWe store user health records for treatment history."
        )
      );

      const report = await reviewProject({ cwd: result.outputDir });

      const consistencyFindings = report.findings.filter(
        (finding) => finding.category === "consistency"
      );

      assert.equal(consistencyFindings.length, 1);
      assert.match(consistencyFindings[0].message, /"health"/);
    }
  );
});

test("sensitive-data keywords are not flagged when sensitiveData is true", async () => {
  await withTempProject(
    {
      projectName: "Sensitive Enabled Project",
      sensitiveData: true
    },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/07-data/USER_DATA.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "## Data collected\n\nTODO",
          "## Data collected\n\nWe store user health records for treatment history."
        )
      );

      const report = await reviewProject({ cwd: result.outputDir });

      const consistencyFindings = report.findings.filter(
        (finding) => finding.category === "consistency"
      );

      assert.equal(consistencyFindings.length, 0);
    }
  );
});

test("authentication content mismatch is flagged when authentication is false", async () => {
  await withTempProject(
    { projectName: "Auth Mismatch Project", authentication: false },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/05-architecture/SYSTEM_ARCHITECTURE.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "### Authentication\n\nTODO",
          "### Authentication\n\nUsers log in with a username and password."
        )
      );

      const report = await reviewProject({ cwd: result.outputDir });

      const consistencyFindings = report.findings.filter(
        (finding) => finding.category === "consistency"
      );

      assert.equal(consistencyFindings.length, 1);
      assert.match(consistencyFindings[0].message, /authentication: false/);
    }
  );
});

test("authentication content mismatch is not flagged when authentication is true", async () => {
  await withTempProject(
    { projectName: "Auth Enabled Project", authentication: true },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/05-architecture/SYSTEM_ARCHITECTURE.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace(
          "### Authentication\n\nTODO",
          "### Authentication\n\nUsers log in with a username and password."
        )
      );

      const report = await reviewProject({ cwd: result.outputDir });

      const consistencyFindings = report.findings.filter(
        (finding) => finding.category === "consistency"
      );

      assert.equal(consistencyFindings.length, 0);
    }
  );
});
