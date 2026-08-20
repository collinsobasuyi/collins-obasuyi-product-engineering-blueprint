import fs from "fs-extra";
import path from "path";

import {
  baselineTemplates,
  checklistTemplates,
  getBlueprintRoot,
  renderTemplateContent
} from "./generate-project.js";
import { extractHeadingSection } from "./doc-utils.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBlocks(content, idPrefix) {
  const headingRegex = new RegExp(
    `^#{2,4}\\s+(${escapeRegExp(idPrefix)}-\\d+)\\s*$`,
    "gm"
  );

  const matches = [...content.matchAll(headingRegex)];
  const blocks = [];

  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index;
    const end =
      i + 1 < matches.length ? matches[i + 1].index : content.length;

    blocks.push({
      id: matches[i][1],
      text: content.slice(start, end)
    });
  }

  return blocks;
}

function extractField(blockText, label) {
  const regex = new RegExp(
    `\\*\\*${escapeRegExp(label)}:\\*\\*\\s*(.*)`
  );

  const match = blockText.match(regex);

  return match ? match[1].trim() : null;
}

const FIELD_LINKAGE_RULES = [
  {
    template: "templates/requirements/FUNCTIONAL_REQUIREMENTS.md",
    file: "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md",
    idPrefix: "FR",
    field: "Related product requirement",
    message: (id) => `${id} has no linked product requirement.`
  },
  {
    template: "templates/requirements/FUNCTIONAL_REQUIREMENTS.md",
    file: "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md",
    idPrefix: "FR",
    field: "Acceptance criteria",
    message: (id) => `${id} has no linked acceptance criteria.`
  },
  {
    template: "templates/requirements/ACCEPTANCE_CRITERIA.md",
    file: "docs/02-requirements/ACCEPTANCE_CRITERIA.md",
    idPrefix: "AC",
    field: "Related requirement",
    message: (id) => `${id} has no linked requirement.`
  },
  {
    template: "templates/security/THREAT_MODEL.md",
    file: "docs/08-security/THREAT_MODEL.md",
    idPrefix: "TM",
    field: "Mitigation",
    message: (id) => `${id} has no documented mitigation.`
  }
];

const SENSITIVE_DATA_KEYWORDS = [
  "health",
  "medical",
  "biometric",
  "social security",
  "credit card",
  "genetic data",
  "religious belief",
  "sexual orientation",
  "criminal record"
];

const AUTHENTICATION_KEYWORDS = [
  "password",
  "login",
  "log in",
  "sign in",
  "session token",
  "oauth",
  "authenticate",
  "mfa",
  "multi-factor"
];

async function evaluateFieldLinkageRules({
  blueprintRoot,
  projectDir,
  replacements
}) {
  const findings = [];

  for (const rule of FIELD_LINKAGE_RULES) {
    const filePath = path.join(projectDir, rule.file);

    if (!(await fs.pathExists(filePath))) {
      continue;
    }

    const actualContent = await fs.readFile(filePath, "utf8");
    const freshContent = await renderTemplateContent(
      path.join(blueprintRoot, rule.template),
      replacements
    );

    const freshBlocks = extractBlocks(freshContent, rule.idPrefix);
    const freshById = new Map(
      freshBlocks.map((block) => [block.id, block.text])
    );

    const actualBlocks = extractBlocks(actualContent, rule.idPrefix);

    for (const block of actualBlocks) {
      const freshText = freshById.get(block.id);
      const isUnchanged = freshText !== undefined && freshText === block.text;

      if (isUnchanged) {
        continue;
      }

      const value = extractField(block.text, rule.field);

      if (!value || value === "TODO") {
        findings.push({
          category: "traceability",
          message: rule.message(block.id),
          file: rule.file
        });
      }
    }
  }

  return findings;
}

async function evaluateSensitiveDataConsistency({ config, projectDir }) {
  if (config.modules.sensitiveData || config.modules.regulated) {
    return [];
  }

  const findings = [];
  const destinations = [
    ...baselineTemplates.map(([, destination]) => destination),
    ...checklistTemplates.map(([, destination]) => destination)
  ];

  for (const destination of destinations) {
    const filePath = path.join(projectDir, destination);

    if (!(await fs.pathExists(filePath))) {
      continue;
    }

    const content = (await fs.readFile(filePath, "utf8")).toLowerCase();
    const matchedKeyword = SENSITIVE_DATA_KEYWORDS.find((keyword) =>
      content.includes(keyword)
    );

    if (matchedKeyword) {
      findings.push({
        category: "consistency",
        message:
          `.blueprint.json says sensitiveData and regulated are both false, ` +
          `but ${destination} mentions "${matchedKeyword}" — worth double-checking ` +
          `whether this project actually handles sensitive data.`,
        file: destination
      });
    }
  }

  return findings;
}

async function evaluateAuthenticationConsistency({ config, projectDir }) {
  if (config.modules.authentication) {
    return [];
  }

  const destination = "docs/05-architecture/SYSTEM_ARCHITECTURE.md";
  const filePath = path.join(projectDir, destination);

  if (!(await fs.pathExists(filePath))) {
    return [];
  }

  const content = await fs.readFile(filePath, "utf8");
  const section = extractHeadingSection(content, "Authentication");

  if (!section || section === "TODO") {
    return [];
  }

  const lowerSection = section.toLowerCase();
  const matchedKeyword = AUTHENTICATION_KEYWORDS.find((keyword) =>
    lowerSection.includes(keyword)
  );

  if (!matchedKeyword) {
    return [];
  }

  return [
    {
      category: "consistency",
      message:
        `.blueprint.json says authentication: false, but ${destination}'s ` +
        `Authentication section describes real authentication behaviour ` +
        `("${matchedKeyword}") — worth reconciling.`,
      file: destination
    }
  ];
}

export async function reviewProject({ cwd = process.cwd() } = {}) {
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

  const findings = [
    ...(await evaluateFieldLinkageRules({
      blueprintRoot,
      projectDir: cwd,
      replacements
    })),
    ...(await evaluateSensitiveDataConsistency({
      config,
      projectDir: cwd
    })),
    ...(await evaluateAuthenticationConsistency({
      config,
      projectDir: cwd
    }))
  ];

  return {
    project: {
      name: config.project.name,
      slug: config.project.slug
    },
    findings,
    summary: {
      totalFindings: findings.length
    }
  };
}
