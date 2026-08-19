import fs from "fs-extra";
import path from "path";

import {
  baselineTemplates,
  checklistTemplates,
  conditionalTemplateGroups,
  getBlueprintRoot,
  renderTemplateContent
} from "./generate-project.js";

const ACRONYMS = new Set([
  "AI",
  "MVP",
  "UX",
  "API",
  "E2E",
  "QA"
]);

const BLOCKER_FILE_NAMES = new Set([
  "SECURITY_BASELINE.md",
  "THREAT_MODEL.md",
  "RELEASE_SECURITY_GATE.md",
  "RELEASE_QUALITY_GATE.md",
  "PRIVACY_MODEL.md"
]);

function titleCaseWord(word) {
  const upper = word.toUpperCase();

  if (ACRONYMS.has(upper)) {
    return upper;
  }

  return (
    word.charAt(0).toUpperCase() +
    word.slice(1).toLowerCase()
  );
}

function humanizeFileName(destination) {
  const base = path.basename(destination, ".md");

  return base
    .split(/[_-]/)
    .map(titleCaseWord)
    .join(" ");
}

function deriveCategory(destination) {
  const parts = destination.split("/");

  if (parts[0] === "docs" && parts.length > 1) {
    const folder = parts[1];
    const name = folder.replace(/^\d+-/, "").replace(/-/g, " ");

    return {
      key: folder,
      label: name
        .split(" ")
        .map(titleCaseWord)
        .join(" ")
    };
  }

  if (parts[0] === "checklists") {
    return {
      key: "zzz-checklists",
      label: "Checklists"
    };
  }

  return {
    key: "other",
    label: "Other"
  };
}

function countUnresolvedMarkers(content) {
  const todoMatches = content.match(/\bTODO\b/g) || [];
  const uncheckedBoxMatches = content.match(/^- \[ \]/gm) || [];

  return todoMatches.length + uncheckedBoxMatches.length;
}

async function assessDocument({
  blueprintRoot,
  projectDir,
  template,
  destination,
  replacements
}) {
  const templatePath = path.join(blueprintRoot, template);
  const filePath = path.join(projectDir, destination);

  const freshContent = await renderTemplateContent(
    templatePath,
    replacements
  );

  const exists = await fs.pathExists(filePath);

  if (!exists) {
    return {
      title: humanizeFileName(destination),
      file: destination,
      status: "missing",
      unresolvedCount: 0
    };
  }

  const actualContent = await fs.readFile(filePath, "utf8");

  if (actualContent === freshContent) {
    return {
      title: humanizeFileName(destination),
      file: destination,
      status: "not-started",
      unresolvedCount: 0
    };
  }

  const unresolvedCount = countUnresolvedMarkers(actualContent);

  if (unresolvedCount > 0) {
    return {
      title: humanizeFileName(destination),
      file: destination,
      status: "todo",
      unresolvedCount
    };
  }

  return {
    title: humanizeFileName(destination),
    file: destination,
    status: "complete",
    unresolvedCount: 0
  };
}

export async function checkProject({ cwd = process.cwd() } = {}) {
  const blueprintConfigPath = path.join(cwd, ".blueprint.json");

  if (!(await fs.pathExists(blueprintConfigPath))) {
    throw new Error(
      "No .blueprint.json found here. Run this inside a project created with " +
        '"collins-obasuyi-blueprint init".'
    );
  }

  const config = await fs.readJson(blueprintConfigPath);
  const blueprintRoot = getBlueprintRoot();

  const replacements = {
    PROJECT_NAME: config.project.name,
    PROJECT_SLUG: config.project.slug,
    BLUEPRINT_VERSION: config.blueprintVersion,
    CREATED_DATE: config.createdAt.slice(0, 10)
  };

  const scoredTemplates = [
    ...baselineTemplates,
    ...checklistTemplates
  ];

  for (const group of conditionalTemplateGroups) {
    if (group.isEnabled(config.modules)) {
      scoredTemplates.push(...group.templates);
    }
  }

  const categoriesByKey = new Map();

  for (const [template, destination] of scoredTemplates) {
    const document = await assessDocument({
      blueprintRoot,
      projectDir: cwd,
      template,
      destination,
      replacements
    });

    const category = deriveCategory(destination);

    if (!categoriesByKey.has(category.key)) {
      categoriesByKey.set(category.key, {
        key: category.key,
        label: category.label,
        documents: []
      });
    }

    categoriesByKey.get(category.key).documents.push(document);
  }

  const categories = Array.from(categoriesByKey.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );

  let totalDocuments = 0;
  let completeDocuments = 0;
  let unresolvedTodos = 0;
  const blockerDocuments = [];

  for (const category of categories) {
    for (const document of category.documents) {
      totalDocuments += 1;

      if (document.status === "complete") {
        completeDocuments += 1;
      }

      if (document.status === "todo") {
        unresolvedTodos += document.unresolvedCount;
      }

      const baseName = path.basename(document.file);

      if (
        BLOCKER_FILE_NAMES.has(baseName) &&
        document.status !== "complete"
      ) {
        blockerDocuments.push(document);
      }
    }
  }

  const incompleteDocuments = totalDocuments - completeDocuments;

  const readiness =
    totalDocuments === 0
      ? 0
      : Math.round((completeDocuments / totalDocuments) * 100);

  return {
    project: {
      name: config.project.name,
      slug: config.project.slug
    },
    categories,
    summary: {
      readiness,
      totalDocuments,
      completeDocuments,
      incompleteDocuments,
      blockers: blockerDocuments.length,
      unresolvedTodos
    },
    blockerDocuments
  };
}
