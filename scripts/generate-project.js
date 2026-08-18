import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blueprintRoot = path.resolve(__dirname, "..");

async function renderTemplate(
  templatePath,
  destinationPath,
  replacements
) {
  let content = await fs.readFile(templatePath, "utf8");

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(
      `{{${key}}}`,
      String(value)
    );
  }

  await fs.ensureDir(
    path.dirname(destinationPath)
  );

  await fs.writeFile(
    destinationPath,
    content
  );
}

export function createSlug(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const baselineTemplates = [
  [
    "templates/product/PRODUCT_OVERVIEW.md",
    "docs/00-product/PRODUCT_OVERVIEW.md"
  ],
  [
    "templates/product/MVP_SCOPE.md",
    "docs/00-product/MVP_SCOPE.md"
  ],
  [
    "templates/product/PRODUCT_PRINCIPLES.md",
    "docs/00-product/PRODUCT_PRINCIPLES.md"
  ],

  [
    "templates/research/MARKET_RESEARCH.md",
    "docs/01-research/MARKET_RESEARCH.md"
  ],
  [
    "templates/research/COMPETITOR_LANDSCAPE.md",
    "docs/01-research/COMPETITOR_LANDSCAPE.md"
  ],
  [
    "templates/research/USER_RESEARCH.md",
    "docs/01-research/USER_RESEARCH.md"
  ],
  [
    "templates/research/VALIDATION_PLAN.md",
    "docs/01-research/VALIDATION_PLAN.md"
  ],
  [
    "templates/research/VALIDATION_LOG.md",
    "docs/01-research/VALIDATION_LOG.md"
  ],

  [
    "templates/requirements/PRODUCT_REQUIREMENTS.md",
    "docs/02-requirements/PRODUCT_REQUIREMENTS.md"
  ],
  [
    "templates/requirements/FUNCTIONAL_REQUIREMENTS.md",
    "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md"
  ],
  [
    "templates/requirements/NON_FUNCTIONAL_REQUIREMENTS.md",
    "docs/02-requirements/NON_FUNCTIONAL_REQUIREMENTS.md"
  ],
  [
    "templates/requirements/USER_STORIES.md",
    "docs/02-requirements/USER_STORIES.md"
  ],
  [
    "templates/requirements/ACCEPTANCE_CRITERIA.md",
    "docs/02-requirements/ACCEPTANCE_CRITERIA.md"
  ],
  [
    "templates/requirements/TRACEABILITY_MATRIX.md",
    "docs/02-requirements/TRACEABILITY_MATRIX.md"
  ],

  [
    "templates/design/UX_PRINCIPLES.md",
    "docs/03-design/UX_PRINCIPLES.md"
  ],
  [
    "templates/design/USER_JOURNEYS.md",
    "docs/03-design/USER_JOURNEYS.md"
  ],
  [
    "templates/design/INFORMATION_ARCHITECTURE.md",
    "docs/03-design/INFORMATION_ARCHITECTURE.md"
  ],
  [
    "templates/design/DESIGN_SYSTEM.md",
    "docs/03-design/DESIGN_SYSTEM.md"
  ],
  [
    "templates/design/ACCESSIBILITY_REQUIREMENTS.md",
    "docs/03-design/ACCESSIBILITY_REQUIREMENTS.md"
  ],

  [
    "templates/domain/DOMAIN_MODEL.md",
    "docs/04-domain/DOMAIN_MODEL.md"
  ],
  [
    "templates/domain/BUSINESS_RULES.md",
    "docs/04-domain/BUSINESS_RULES.md"
  ],
  [
    "templates/domain/DECISION_RULES.md",
    "docs/04-domain/DECISION_RULES.md"
  ],
  [
    "templates/domain/SAFETY_BOUNDARIES.md",
    "docs/04-domain/SAFETY_BOUNDARIES.md"
  ],

  [
    "templates/architecture/SYSTEM_ARCHITECTURE.md",
    "docs/05-architecture/SYSTEM_ARCHITECTURE.md"
  ],

  [
    "templates/data/DATA_DICTIONARY.md",
    "docs/07-data/DATA_DICTIONARY.md"
  ],
  [
    "templates/data/DATA_PROVENANCE.md",
    "docs/07-data/DATA_PROVENANCE.md"
  ],
  [
    "templates/data/DATA_RETENTION.md",
    "docs/07-data/DATA_RETENTION.md"
  ],
  [
    "templates/data/USER_DATA.md",
    "docs/07-data/USER_DATA.md"
  ],

  [
    "templates/security/SECURITY_BASELINE.md",
    "docs/08-security/SECURITY_BASELINE.md"
  ],
  [
    "templates/security/THREAT_MODEL.md",
    "docs/08-security/THREAT_MODEL.md"
  ],
  [
    "templates/security/SECURITY_TEST_PLAN.md",
    "docs/08-security/SECURITY_TEST_PLAN.md"
  ],
  [
    "templates/security/RELEASE_SECURITY_GATE.md",
    "docs/08-security/RELEASE_SECURITY_GATE.md"
  ],

  [
    "templates/quality/QUALITY_STRATEGY.md",
    "docs/10-quality/QUALITY_STRATEGY.md"
  ],
  [
    "templates/quality/TEST_STRATEGY.md",
    "docs/10-quality/TEST_STRATEGY.md"
  ],
  [
    "templates/quality/TEST_PLAN.md",
    "docs/10-quality/TEST_PLAN.md"
  ],
  [
    "templates/quality/E2E_TEST_PLAN.md",
    "docs/10-quality/E2E_TEST_PLAN.md"
  ],
  [
    "templates/quality/API_TEST_PLAN.md",
    "docs/10-quality/API_TEST_PLAN.md"
  ],
  [
    "templates/quality/ACCESSIBILITY_TEST_PLAN.md",
    "docs/10-quality/ACCESSIBILITY_TEST_PLAN.md"
  ],
  [
    "templates/quality/RELEASE_QUALITY_GATE.md",
    "docs/10-quality/RELEASE_QUALITY_GATE.md"
  ],

  [
    "templates/performance/PERFORMANCE_BASELINE.md",
    "docs/11-performance/PERFORMANCE_BASELINE.md"
  ],
  [
    "templates/performance/PERFORMANCE_BUDGET.md",
    "docs/11-performance/PERFORMANCE_BUDGET.md"
  ],
  [
    "templates/performance/PERFORMANCE_TEST_PLAN.md",
    "docs/11-performance/PERFORMANCE_TEST_PLAN.md"
  ],
  [
    "templates/performance/PERFORMANCE_BACKLOG.md",
    "docs/11-performance/PERFORMANCE_BACKLOG.md"
  ],

  [
    "templates/planning/ROADMAP.md",
    "docs/12-planning/ROADMAP.md"
  ],
  [
    "templates/planning/SPRINT_PLAN.md",
    "docs/12-planning/SPRINT_PLAN.md"
  ],
  [
    "templates/planning/MVP_DELIVERY_PLAN.md",
    "docs/12-planning/MVP_DELIVERY_PLAN.md"
  ],
  [
    "templates/planning/BACKLOG.md",
    "docs/12-planning/BACKLOG.md"
  ],
  [
    "templates/planning/DEPENDENCIES.md",
    "docs/12-planning/DEPENDENCIES.md"
  ],
  [
    "templates/planning/DECISION_LOG.md",
    "docs/12-planning/DECISION_LOG.md"
  ],

  [
    "templates/business/BUSINESS_MODEL.md",
    "docs/13-business/BUSINESS_MODEL.md"
  ],
  [
    "templates/business/PRICING.md",
    "docs/13-business/PRICING.md"
  ],
  [
    "templates/business/GO_TO_MARKET.md",
    "docs/13-business/GO_TO_MARKET.md"
  ],
  [
    "templates/business/EXPERIMENTS.md",
    "docs/13-business/EXPERIMENTS.md"
  ],

  [
    "templates/operations/ENVIRONMENTS.md",
    "docs/14-operations/ENVIRONMENTS.md"
  ],
  [
    "templates/operations/DEPLOYMENT.md",
    "docs/14-operations/DEPLOYMENT.md"
  ],
  [
    "templates/operations/OBSERVABILITY.md",
    "docs/14-operations/OBSERVABILITY.md"
  ],
  [
    "templates/operations/INCIDENT_RESPONSE.md",
    "docs/14-operations/INCIDENT_RESPONSE.md"
  ],
  [
    "templates/operations/RUNBOOK.md",
    "docs/14-operations/RUNBOOK.md"
  ]
];

export async function generateProject({
  projectName,
  isAI = false,
  sensitiveData = false,
  authentication = false,
  integrations = false,
  regulated = false,
  mobile = false,
  cwd = process.cwd()
}) {
  if (!projectName || !projectName.trim()) {
    throw new Error("Project name is required.");
  }

  const slug = createSlug(projectName);

  if (!slug) {
    throw new Error("Project name must contain letters or numbers.");
  }

  const outputDir = path.resolve(
    cwd,
    slug
  );

  if (await fs.pathExists(outputDir)) {
    throw new Error(
      `A folder named "${slug}" already exists.`
    );
  }

  const createdDate = new Date()
    .toISOString()
    .slice(0, 10);

  const replacements = {
    PROJECT_NAME: projectName,
    PROJECT_SLUG: slug,
    BLUEPRINT_VERSION: "0.1.0",
    CREATED_DATE: createdDate
  };

  const config = {
    blueprint: "Collins Obasuyi Product Engineering Blueprint",
    blueprintVersion: "0.1.0",
    generator: "collins-obasuyi-blueprint",
    createdAt: new Date().toISOString(),

    project: {
      name: projectName,
      slug
    },

    modules: {
      ai: isAI,
      sensitiveData,
      authentication,
      integrations,
      regulated,
      mobile
    }
  };

  await fs.ensureDir(outputDir);

  await fs.writeJson(
    path.join(outputDir, ".blueprint.json"),
    config,
    { spaces: 2 }
  );

  await renderTemplate(
    path.join(
      blueprintRoot,
      "templates/core/AGENTS.md"
    ),
    path.join(
      outputDir,
      "AGENTS.md"
    ),
    replacements
  );

  await renderTemplate(
    path.join(
      blueprintRoot,
      "templates/core/README.md"
    ),
    path.join(
      outputDir,
      "README.md"
    ),
    replacements
  );

  for (const [template, destination] of baselineTemplates) {
    await renderTemplate(
      path.join(
        blueprintRoot,
        template
      ),
      path.join(
        outputDir,
        destination
      ),
      replacements
    );
  }

  if (isAI) {
    await renderTemplate(
      path.join(
        blueprintRoot,
        "templates/ai/AI_ARCHITECTURE.md"
      ),
      path.join(
        outputDir,
        "docs/06-ai/AI_ARCHITECTURE.md"
      ),
      replacements
    );

    await renderTemplate(
      path.join(
        blueprintRoot,
        "templates/ai/AI_GUARDRAILS.md"
      ),
      path.join(
        outputDir,
        "docs/06-ai/AI_GUARDRAILS.md"
      ),
      replacements
    );

    await fs.ensureDir(
      path.join(
        outputDir,
        "docs/15-evidence/ai-evaluations"
      )
    );
  }

  if (sensitiveData || regulated) {
    await renderTemplate(
      path.join(
        blueprintRoot,
        "templates/privacy/PRIVACY_MODEL.md"
      ),
      path.join(
        outputDir,
        "docs/09-privacy-governance/PRIVACY_MODEL.md"
      ),
      replacements
    );
  }

  await fs.ensureDir(
    path.join(
      outputDir,
      "docs/15-evidence/releases"
    )
  );

  await fs.ensureDir(
    path.join(
      outputDir,
      "docs/15-evidence/security"
    )
  );

  await fs.ensureDir(
    path.join(
      outputDir,
      "docs/15-evidence/performance"
    )
  );

  if (mobile) {
    await fs.ensureDir(
      path.join(
        outputDir,
        "docs/15-evidence/accessibility"
      )
    );
  }

  return {
    outputDir,
    slug,
    config
  };
}
