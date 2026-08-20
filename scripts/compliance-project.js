import fs from "fs-extra";
import path from "path";

import {
  getBlueprintRoot,
  renderTemplateContent,
  templateByDestination
} from "./generate-project.js";
import { extractHeadingSection } from "./doc-utils.js";
import { checkProject } from "./check-project.js";

const FRAMEWORKS = {
  iso27001: {
    label: "ISO 27001",
    areas: [
      {
        area: "Information security policy",
        file: "docs/08-security/SECURITY_BASELINE.md"
      },
      {
        area: "Risk assessment",
        file: "docs/08-security/THREAT_MODEL.md"
      },
      {
        area: "Access control",
        file: "docs/08-security/SECURITY_BASELINE.md"
      },
      {
        area: "Incident management",
        file: "docs/14-operations/INCIDENT_RESPONSE.md"
      },
      {
        area: "Logging and monitoring",
        file: "docs/14-operations/OBSERVABILITY.md"
      },
      {
        area: "Operational continuity",
        file: "docs/14-operations/RUNBOOK.md"
      },
      {
        area: "Asset and data inventory",
        file: "docs/07-data/DATA_DICTIONARY.md"
      },
      {
        area: "Information lifecycle",
        file: "docs/07-data/DATA_RETENTION.md"
      },
      {
        area: "Security testing",
        file: "docs/08-security/SECURITY_TEST_PLAN.md"
      },
      {
        area: "Assurance evidence",
        file: "docs/08-security/RELEASE_SECURITY_GATE.md"
      }
    ]
  },
  gdpr: {
    label: "GDPR",
    areas: [
      {
        area: "Data inventory",
        file: "docs/07-data/DATA_DICTIONARY.md"
      },
      {
        area: "Retention schedule",
        file: "docs/07-data/DATA_RETENTION.md"
      },
      {
        area: "Lawful basis and consent",
        file: "docs/09-privacy-governance/PRIVACY_MODEL.md",
        section: "Consent and transparency"
      },
      {
        area: "Data minimisation",
        file: "docs/09-privacy-governance/PRIVACY_MODEL.md",
        section: "Minimisation"
      },
      {
        area: "Data subject deletion rights",
        file: "docs/09-privacy-governance/PRIVACY_MODEL.md",
        section: "Deletion"
      },
      {
        area: "Third-party processors",
        file: "docs/09-privacy-governance/PRIVACY_MODEL.md",
        section: "Third parties"
      }
    ]
  }
};

export const SUPPORTED_STANDARDS = Object.keys(FRAMEWORKS);

function countUnresolvedMarkers(content) {
  const todoMatches = content.match(/\bTODO\b/g) || [];
  const uncheckedBoxMatches = content.match(/^- \[ \]/gm) || [];

  return todoMatches.length + uncheckedBoxMatches.length;
}

async function assessArea({
  area,
  blueprintRoot,
  projectDir,
  replacements,
  documentStatusByFile
}) {
  const filePath = path.join(projectDir, area.file);

  if (!(await fs.pathExists(filePath))) {
    return {
      area: area.area,
      file: area.file,
      section: area.section || null,
      status: "no-document"
    };
  }

  if (!area.section) {
    const status = documentStatusByFile.get(area.file) || "no-document";

    return {
      area: area.area,
      file: area.file,
      section: null,
      status
    };
  }

  const templatePath = templateByDestination.get(area.file);
  const freshContent = await renderTemplateContent(
    path.join(blueprintRoot, templatePath),
    replacements
  );

  const actualContent = await fs.readFile(filePath, "utf8");

  const freshSection = extractHeadingSection(freshContent, area.section);
  const actualSection = extractHeadingSection(actualContent, area.section);

  if (actualSection === freshSection) {
    return {
      area: area.area,
      file: area.file,
      section: area.section,
      status: "not-started"
    };
  }

  const unresolvedCount = countUnresolvedMarkers(actualSection);

  return {
    area: area.area,
    file: area.file,
    section: area.section,
    status: unresolvedCount > 0 ? "todo" : "complete"
  };
}

export async function complianceProject({
  cwd = process.cwd(),
  standard
}) {
  const key = String(standard || "").toLowerCase();
  const framework = FRAMEWORKS[key];

  if (!framework) {
    throw new Error(
      `Unknown standard: "${standard}". Supported: ${SUPPORTED_STANDARDS.join(", ")}.`
    );
  }

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

  const checkReport = await checkProject({ cwd });
  const documentStatusByFile = new Map();

  for (const category of checkReport.categories) {
    for (const document of category.documents) {
      documentStatusByFile.set(document.file, document.status);
    }
  }

  const areas = [];

  for (const area of framework.areas) {
    areas.push(
      await assessArea({
        area,
        blueprintRoot,
        projectDir: cwd,
        replacements,
        documentStatusByFile
      })
    );
  }

  const coveredAreas = areas.filter(
    (item) => item.status === "complete"
  ).length;

  const coverage =
    areas.length === 0
      ? 0
      : Math.round((coveredAreas / areas.length) * 100);

  return {
    project: {
      name: config.project.name,
      slug: config.project.slug
    },
    standard: key,
    label: framework.label,
    areas,
    summary: {
      coverage,
      totalAreas: areas.length,
      coveredAreas
    }
  };
}
