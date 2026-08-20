import fs from "fs-extra";
import path from "path";

import {
  getBlueprintRoot,
  renderTemplateContent,
  templateByDestination
} from "./generate-project.js";

export const ASSISTABLE_DOCUMENTS = {
  PRODUCT_OVERVIEW: {
    template: "templates/product/PRODUCT_OVERVIEW.md",
    destination: "docs/00-product/PRODUCT_OVERVIEW.md",
    contextDocuments: [
      "IDEA.md"
    ]
  },
  THREAT_MODEL: {
    template: "templates/security/THREAT_MODEL.md",
    destination: "docs/08-security/THREAT_MODEL.md",
    contextDocuments: [
      "docs/00-product/PRODUCT_OVERVIEW.md",
      "docs/00-product/MVP_SCOPE.md",
      "docs/05-architecture/SYSTEM_ARCHITECTURE.md",
      "docs/07-data/DATA_DICTIONARY.md",
      "docs/08-security/SECURITY_BASELINE.md"
    ]
  },
  PRIVACY_MODEL: {
    template: "templates/privacy/PRIVACY_MODEL.md",
    destination: "docs/09-privacy-governance/PRIVACY_MODEL.md",
    contextDocuments: [
      "docs/00-product/PRODUCT_OVERVIEW.md",
      "docs/05-architecture/SYSTEM_ARCHITECTURE.md",
      "docs/07-data/DATA_DICTIONARY.md",
      "docs/07-data/DATA_RETENTION.md",
      "docs/07-data/USER_DATA.md"
    ]
  },
  TEST_STRATEGY: {
    template: "templates/quality/TEST_STRATEGY.md",
    destination: "docs/10-quality/TEST_STRATEGY.md",
    contextDocuments: [
      "docs/00-product/PRODUCT_OVERVIEW.md",
      "docs/00-product/MVP_SCOPE.md",
      "docs/05-architecture/SYSTEM_ARCHITECTURE.md",
      "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md"
    ]
  },
  AI_GUARDRAILS: {
    template: "templates/ai/AI_GUARDRAILS.md",
    destination: "docs/06-ai/AI_GUARDRAILS.md",
    contextDocuments: [
      "docs/00-product/PRODUCT_OVERVIEW.md",
      "docs/05-architecture/SYSTEM_ARCHITECTURE.md",
      "docs/06-ai/AI_ARCHITECTURE.md"
    ]
  }
};

export function resolveAssistSpec(documentName) {
  const key = String(documentName || "").toUpperCase();
  const spec = ASSISTABLE_DOCUMENTS[key];

  if (!spec) {
    throw new Error(
      `Unknown document: "${documentName}". Supported: ${Object.keys(ASSISTABLE_DOCUMENTS).join(", ")}.`
    );
  }

  return { key, spec };
}

function draftPathFor(destinationPath) {
  return destinationPath.replace(/\.md$/, ".draft.md");
}

async function hasRealContent({ blueprintRoot, destination, content, replacements }) {
  const templatePath = templateByDestination.get(destination);

  if (!templatePath) {
    // Not a blueprint-generated document (e.g. IDEA.md) -- there is no
    // template to diff against, so "real content" just means non-empty.
    return content.trim().length > 0;
  }

  const fresh = await renderTemplateContent(
    path.join(blueprintRoot, templatePath),
    replacements
  );

  return content !== fresh;
}

export async function loadAssistTarget({ cwd = process.cwd(), documentName }) {
  const { key, spec } = resolveAssistSpec(documentName);

  const blueprintConfigPath = path.join(cwd, ".blueprint.json");

  if (!(await fs.pathExists(blueprintConfigPath))) {
    throw new Error(
      "No .blueprint.json found here. Run this inside a project created with " +
        '"collins-obasuyi-blueprint init".'
    );
  }

  const config = await fs.readJson(blueprintConfigPath);
  const destinationPath = path.join(cwd, spec.destination);

  if (!(await fs.pathExists(destinationPath))) {
    throw new Error(
      `${spec.destination} does not exist in this project (its module may not ` +
        "be enabled). Nothing to assist."
    );
  }

  const blueprintRoot = getBlueprintRoot();

  const replacements = {
    PROJECT_NAME: config.project.name,
    PROJECT_SLUG: config.project.slug,
    BLUEPRINT_VERSION: config.blueprintVersion,
    CREATED_DATE: config.createdAt.slice(0, 10)
  };

  const templateContent = await renderTemplateContent(
    path.join(blueprintRoot, spec.template),
    replacements
  );

  const actualContent = await fs.readFile(destinationPath, "utf8");
  const hasExistingContent = actualContent !== templateContent;

  const contextDocuments = [];

  for (const contextDestination of spec.contextDocuments) {
    const contextPath = path.join(cwd, contextDestination);

    if (await fs.pathExists(contextPath)) {
      const content = await fs.readFile(contextPath, "utf8");

      contextDocuments.push({
        path: contextDestination,
        content,
        hasContent: await hasRealContent({
          blueprintRoot,
          destination: contextDestination,
          content,
          replacements
        })
      });
    }
  }

  const contextHasContent = contextDocuments.some((doc) => doc.hasContent);

  return {
    key,
    spec,
    config,
    templateContent,
    actualContent,
    hasExistingContent,
    contextDocuments,
    contextHasContent,
    destinationPath,
    draftPath: draftPathFor(destinationPath)
  };
}

function extractTopLevelHeadings(content) {
  return (content.match(/^## .+$/gm) || []).map((line) => line.trim());
}

export function buildAssistPrompt({ config, templateContent, contextDocuments }) {
  const system = [
    "You are drafting a single engineering document for a software project.",
    "The project follows a fixed documentation template. Fill in the provided " +
      "template exactly as structured -- same headings, same order -- replacing " +
      "TODO placeholders and underspecified prose with grounded, specific content.",
    "Only use facts supported by the provided project context. Where the " +
      "context does not cover something, leave a clearly-marked placeholder " +
      "rather than inventing specifics.",
    "Your response must contain ONLY the filled-in document, starting directly " +
      "with its top-level '#' heading. Do not add commentary, explanation, or " +
      "markdown code fences. Do not repeat, quote, summarise, or append the " +
      "project context or the template instructions -- they are input for you " +
      "to draw from, not content to include in the output. The document ends " +
      "where the template's own last section ends; add no sections beyond it."
  ].join(" ");

  const enabledModules = Object.entries(config.modules)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  const contextSection =
    contextDocuments.length > 0
      ? contextDocuments
          .map((doc) => `### ${doc.path}\n\n${doc.content}`)
          .join("\n\n---\n\n")
      : "(no other project documents exist yet)";

  const prompt = [
    `Project: ${config.project.name}`,
    `Modules enabled: ${enabledModules.length > 0 ? enabledModules.join(", ") : "none"}`,
    "",
    "## Project context (input only -- do not include this section, or any " +
      "part of it, in your output)",
    "",
    contextSection,
    "",
    "## Template to fill in",
    "",
    templateContent,
    "",
    "## Your task",
    "",
    "Output the template above with every TODO and underspecified section " +
      "filled in using the project context. Respond with nothing but that " +
      "completed document -- no preamble, no repeated context, no extra " +
      "sections.",
    "",
    "Your output must contain every one of these section headings, in this " +
      "exact order, and no others:",
    "",
    ...extractTopLevelHeadings(templateContent).map((heading) => `- ${heading}`)
  ].join("\n");

  return { system, prompt };
}

export function findMissingSections(templateContent, draftContent) {
  const expected = extractTopLevelHeadings(templateContent);
  const actual = new Set(extractTopLevelHeadings(draftContent));

  return expected.filter((heading) => !actual.has(heading));
}

export async function writeAssistDraft({ draftPath, content }) {
  await fs.writeFile(draftPath, content);
}
