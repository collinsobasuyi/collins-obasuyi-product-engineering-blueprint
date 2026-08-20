import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { generateProject } from "../scripts/generate-project.js";
import {
  ASSISTABLE_DOCUMENTS,
  resolveAssistSpec,
  loadAssistTarget,
  buildAssistPrompt,
  writeAssistDraft
} from "../scripts/assist-project.js";
import { getConfiguredProvider } from "../scripts/providers/index.js";

async function withTempProject(options, run) {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-assist-"
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

test("resolveAssistSpec throws for an unsupported document name", () => {
  assert.throws(
    () => resolveAssistSpec("NOT_A_REAL_DOC"),
    /Unknown document/
  );
});

test("resolveAssistSpec is case-insensitive and covers all four supported documents", () => {
  for (const key of Object.keys(ASSISTABLE_DOCUMENTS)) {
    const { key: resolvedKey } = resolveAssistSpec(key.toLowerCase());

    assert.equal(resolvedKey, key);
  }
});

test("loadAssistTarget throws when there is no .blueprint.json", async () => {
  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "collins-blueprint-assist-"
    )
  );

  try {
    await assert.rejects(
      () =>
        loadAssistTarget({
          cwd: tempDir,
          documentName: "THREAT_MODEL"
        }),
      /No \.blueprint\.json found/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test("loadAssistTarget throws when the target document's module is not enabled", async () => {
  await withTempProject(
    { projectName: "No Privacy Project" },
    async (result) => {
      await assert.rejects(
        () =>
          loadAssistTarget({
            cwd: result.outputDir,
            documentName: "PRIVACY_MODEL"
          }),
        /does not exist in this project/
      );
    }
  );
});

test("loadAssistTarget reports hasExistingContent as false on a freshly generated project", async () => {
  await withTempProject(
    { projectName: "Fresh Assist Project" },
    async (result) => {
      const target = await loadAssistTarget({
        cwd: result.outputDir,
        documentName: "THREAT_MODEL"
      });

      assert.equal(target.hasExistingContent, false);
      assert.equal(target.actualContent, target.templateContent);
    }
  );
});

test("loadAssistTarget reports hasExistingContent as true once the document is edited", async () => {
  await withTempProject(
    { projectName: "Edited Assist Project" },
    async (result) => {
      const filePath = path.join(
        result.outputDir,
        "docs/08-security/THREAT_MODEL.md"
      );

      const original = await fs.readFile(filePath, "utf8");

      await fs.writeFile(
        filePath,
        original.replace("**Threat:** TODO", "**Threat:** Real content.")
      );

      const target = await loadAssistTarget({
        cwd: result.outputDir,
        documentName: "THREAT_MODEL"
      });

      assert.equal(target.hasExistingContent, true);
    }
  );
});

test("loadAssistTarget only includes context documents that actually exist", async () => {
  await withTempProject(
    { projectName: "Partial Context Project", isAI: true },
    async (result) => {
      // Simulate a project missing one of its own context documents (e.g. an
      // older project, or one where a file was deleted by hand) -- loadAssistTarget
      // should skip it gracefully rather than erroring.
      await fs.remove(
        path.join(result.outputDir, "docs/06-ai/AI_ARCHITECTURE.md")
      );

      const target = await loadAssistTarget({
        cwd: result.outputDir,
        documentName: "AI_GUARDRAILS"
      });

      const contextPaths = target.contextDocuments.map((doc) => doc.path);

      assert.equal(
        contextPaths.includes("docs/06-ai/AI_ARCHITECTURE.md"),
        false
      );
      assert.ok(
        contextPaths.includes("docs/00-product/PRODUCT_OVERVIEW.md")
      );
    }
  );
});

test("loadAssistTarget includes every configured context document when all exist", async () => {
  await withTempProject(
    { projectName: "Full Context Project", isAI: true },
    async (result) => {
      const target = await loadAssistTarget({
        cwd: result.outputDir,
        documentName: "AI_GUARDRAILS"
      });

      const contextPaths = target.contextDocuments.map((doc) => doc.path);

      assert.deepEqual(
        contextPaths,
        ASSISTABLE_DOCUMENTS.AI_GUARDRAILS.contextDocuments
      );
    }
  );
});

test("draftPath sits alongside the real file and never overwrites it", async () => {
  await withTempProject(
    { projectName: "Draft Path Project" },
    async (result) => {
      const target = await loadAssistTarget({
        cwd: result.outputDir,
        documentName: "THREAT_MODEL"
      });

      assert.equal(
        target.draftPath,
        path.join(
          result.outputDir,
          "docs/08-security/THREAT_MODEL.draft.md"
        )
      );

      await writeAssistDraft({
        draftPath: target.draftPath,
        content: "draft content from the model"
      });

      assert.equal(
        await fs.readFile(target.draftPath, "utf8"),
        "draft content from the model"
      );

      assert.equal(
        await fs.readFile(target.destinationPath, "utf8"),
        target.templateContent
      );
    }
  );
});

test("buildAssistPrompt includes the template, enabled modules, and context documents", async () => {
  await withTempProject(
    { projectName: "Prompt Project", isAI: true },
    async (result) => {
      const target = await loadAssistTarget({
        cwd: result.outputDir,
        documentName: "AI_GUARDRAILS"
      });

      const { system, prompt } = buildAssistPrompt(target);

      assert.match(system, /Fill in the provided/);
      assert.match(prompt, /Modules enabled: .*ai/);
      assert.match(prompt, /## Template to fill in/);
      assert.match(prompt, /## Project context/);
      assert.match(prompt, /### docs\/00-product\/PRODUCT_OVERVIEW\.md/);
    }
  );
});

test("getConfiguredProvider returns null when BLUEPRINT_AI_PROVIDER is unset", () => {
  const original = process.env.BLUEPRINT_AI_PROVIDER;
  delete process.env.BLUEPRINT_AI_PROVIDER;

  try {
    assert.equal(getConfiguredProvider(), null);
  } finally {
    if (original === undefined) {
      delete process.env.BLUEPRINT_AI_PROVIDER;
    } else {
      process.env.BLUEPRINT_AI_PROVIDER = original;
    }
  }
});

test("getConfiguredProvider throws for an unknown provider name", () => {
  const original = process.env.BLUEPRINT_AI_PROVIDER;
  process.env.BLUEPRINT_AI_PROVIDER = "not-a-real-provider";

  try {
    assert.throws(
      () => getConfiguredProvider(),
      /Unknown BLUEPRINT_AI_PROVIDER/
    );
  } finally {
    if (original === undefined) {
      delete process.env.BLUEPRINT_AI_PROVIDER;
    } else {
      process.env.BLUEPRINT_AI_PROVIDER = original;
    }
  }
});

test("getConfiguredProvider resolves anthropic and openai by name", () => {
  const original = process.env.BLUEPRINT_AI_PROVIDER;

  try {
    process.env.BLUEPRINT_AI_PROVIDER = "anthropic";
    assert.equal(typeof getConfiguredProvider().generate, "function");

    process.env.BLUEPRINT_AI_PROVIDER = "openai";
    assert.equal(typeof getConfiguredProvider().generate, "function");
  } finally {
    if (original === undefined) {
      delete process.env.BLUEPRINT_AI_PROVIDER;
    } else {
      process.env.BLUEPRINT_AI_PROVIDER = original;
    }
  }
});

test("provider generate() refuses to call the network without an API key", async () => {
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    process.env.BLUEPRINT_AI_PROVIDER = "anthropic";

    await assert.rejects(
      () => getConfiguredProvider().generate({ system: "x", prompt: "y" }),
      /ANTHROPIC_API_KEY is not set/
    );

    process.env.BLUEPRINT_AI_PROVIDER = "openai";

    await assert.rejects(
      () => getConfiguredProvider().generate({ system: "x", prompt: "y" }),
      /OPENAI_API_KEY is not set/
    );
  } finally {
    delete process.env.BLUEPRINT_AI_PROVIDER;

    if (originalAnthropicKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
    }

    if (originalOpenAiKey !== undefined) {
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    }
  }
});
