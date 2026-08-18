#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
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

  await fs.ensureDir(path.dirname(destinationPath));
  await fs.writeFile(destinationPath, content);
}

console.log();
console.log(
  chalk.bold("Collins Obasuyi Product Engineering Blueprint")
);
console.log(
  chalk.dim("From idea to secure, tested, production-ready software.")
);
console.log();

const answers = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: "Project name?",
    validate(value) {
      if (!value.trim()) {
        return "Please enter a project name.";
      }

      return true;
    }
  },
  {
    type: "confirm",
    name: "isAI",
    message: "Is this an AI-enabled product?",
    default: false
  },
  {
    type: "confirm",
    name: "sensitiveData",
    message: "Will it process sensitive or health-related data?",
    default: false
  },
  {
    type: "confirm",
    name: "authentication",
    message: "Does it require user authentication?",
    default: true
  },
  {
    type: "confirm",
    name: "integrations",
    message: "Does it use external APIs or third-party integrations?",
    default: false
  },
  {
    type: "confirm",
    name: "regulated",
    message: "Is it in a regulated or high-risk domain?",
    default: false
  },
  {
    type: "confirm",
    name: "mobile",
    message: "Will it support mobile or PWA?",
    default: false
  }
]);

const slug = answers.projectName
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const outputDir = path.resolve(process.cwd(), slug);

if (await fs.pathExists(outputDir)) {
  console.log();
  console.error(
    chalk.red(`A folder named "${slug}" already exists.`)
  );
  process.exit(1);
}

const blueprintConfig = {
  blueprint: "Collins Obasuyi Product Engineering Blueprint",
  blueprintVersion: "0.1.0",
  generator: "collins-obasuyi-blueprint",
  createdAt: new Date().toISOString(),
  project: {
    name: answers.projectName,
    slug
  },
  modules: {
    ai: answers.isAI,
    sensitiveData: answers.sensitiveData,
    authentication: answers.authentication,
    integrations: answers.integrations,
    regulated: answers.regulated,
    mobile: answers.mobile
  }
};

await fs.ensureDir(outputDir);

await fs.writeJson(
  path.join(outputDir, ".blueprint.json"),
  blueprintConfig,
  { spaces: 2 }
);

const coreDirectories = [
  "docs/00-product",
  "docs/01-research",
  "docs/02-requirements",
  "docs/03-design",
  "docs/04-domain",
  "docs/05-architecture",
  "docs/07-data",
    "docs/08-security",
  "docs/10-quality",
  "docs/11-performance",
  "docs/12-planning",
  "docs/13-business",
  "docs/14-operations",
  "docs/15-evidence/releases",
"docs/15-evidence/security"
];

for (const directory of coreDirectories) {
  await fs.ensureDir(
    path.join(outputDir, directory)
  );
}

if (answers.isAI) {
  await fs.ensureDir(
    path.join(outputDir, "docs/06-ai")
  );

  await fs.ensureDir(
    path.join(outputDir, "docs/15-evidence/ai-evaluations")
  );
}


if (
  answers.sensitiveData ||
  answers.regulated
) {
  await fs.ensureDir(
    path.join(outputDir, "docs/09-privacy-governance")
  );
}

if (answers.mobile) {
  await fs.ensureDir(
    path.join(outputDir, "docs/15-evidence/accessibility")
  );
}

await fs.ensureDir(
  path.join(outputDir, "docs/15-evidence/performance")
);

const replacements = {
  PROJECT_NAME: answers.projectName,
  PROJECT_SLUG: slug,
  BLUEPRINT_VERSION: "0.1.0",
  CREATED_DATE: new Date().toISOString().slice(0, 10)
};

const baselineTemplates = [
  // Core
  ["templates/core/AGENTS.md", "AGENTS.md"],
  ["templates/core/README.md", "README.md"],

  // Product
  ["templates/product/PRODUCT_OVERVIEW.md", "docs/00-product/PRODUCT_OVERVIEW.md"],
  ["templates/product/MVP_SCOPE.md", "docs/00-product/MVP_SCOPE.md"],
  ["templates/product/PRODUCT_PRINCIPLES.md", "docs/00-product/PRODUCT_PRINCIPLES.md"],

  // Research
  ["templates/research/MARKET_RESEARCH.md", "docs/01-research/MARKET_RESEARCH.md"],
  ["templates/research/COMPETITOR_LANDSCAPE.md", "docs/01-research/COMPETITOR_LANDSCAPE.md"],
  ["templates/research/USER_RESEARCH.md", "docs/01-research/USER_RESEARCH.md"],
  ["templates/research/VALIDATION_PLAN.md", "docs/01-research/VALIDATION_PLAN.md"],
  ["templates/research/VALIDATION_LOG.md", "docs/01-research/VALIDATION_LOG.md"],

  // Requirements
  ["templates/requirements/PRODUCT_REQUIREMENTS.md", "docs/02-requirements/PRODUCT_REQUIREMENTS.md"],
  ["templates/requirements/FUNCTIONAL_REQUIREMENTS.md", "docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md"],
  ["templates/requirements/NON_FUNCTIONAL_REQUIREMENTS.md", "docs/02-requirements/NON_FUNCTIONAL_REQUIREMENTS.md"],
  ["templates/requirements/USER_STORIES.md", "docs/02-requirements/USER_STORIES.md"],
  ["templates/requirements/ACCEPTANCE_CRITERIA.md", "docs/02-requirements/ACCEPTANCE_CRITERIA.md"],
  ["templates/requirements/TRACEABILITY_MATRIX.md", "docs/02-requirements/TRACEABILITY_MATRIX.md"],

  // Design
  ["templates/design/UX_PRINCIPLES.md", "docs/03-design/UX_PRINCIPLES.md"],
  ["templates/design/USER_JOURNEYS.md", "docs/03-design/USER_JOURNEYS.md"],
  ["templates/design/INFORMATION_ARCHITECTURE.md", "docs/03-design/INFORMATION_ARCHITECTURE.md"],
  ["templates/design/DESIGN_SYSTEM.md", "docs/03-design/DESIGN_SYSTEM.md"],
  ["templates/design/ACCESSIBILITY_REQUIREMENTS.md", "docs/03-design/ACCESSIBILITY_REQUIREMENTS.md"],

  // Domain
  ["templates/domain/DOMAIN_MODEL.md", "docs/04-domain/DOMAIN_MODEL.md"],
  ["templates/domain/BUSINESS_RULES.md", "docs/04-domain/BUSINESS_RULES.md"],
  ["templates/domain/DECISION_RULES.md", "docs/04-domain/DECISION_RULES.md"],
  ["templates/domain/SAFETY_BOUNDARIES.md", "docs/04-domain/SAFETY_BOUNDARIES.md"],

  // Architecture
  ["templates/architecture/SYSTEM_ARCHITECTURE.md", "docs/05-architecture/SYSTEM_ARCHITECTURE.md"],

  // Data
  ["templates/data/DATA_DICTIONARY.md", "docs/07-data/DATA_DICTIONARY.md"],
  ["templates/data/DATA_PROVENANCE.md", "docs/07-data/DATA_PROVENANCE.md"],
  ["templates/data/DATA_RETENTION.md", "docs/07-data/DATA_RETENTION.md"],
  ["templates/data/USER_DATA.md", "docs/07-data/USER_DATA.md"],

  // Security
  ["templates/security/SECURITY_BASELINE.md", "docs/08-security/SECURITY_BASELINE.md"],
  ["templates/security/THREAT_MODEL.md", "docs/08-security/THREAT_MODEL.md"],
  ["templates/security/SECURITY_TEST_PLAN.md", "docs/08-security/SECURITY_TEST_PLAN.md"],
  ["templates/security/RELEASE_SECURITY_GATE.md", "docs/08-security/RELEASE_SECURITY_GATE.md"],

  // Quality
  ["templates/quality/QUALITY_STRATEGY.md", "docs/10-quality/QUALITY_STRATEGY.md"],
  ["templates/quality/TEST_STRATEGY.md", "docs/10-quality/TEST_STRATEGY.md"],
  ["templates/quality/TEST_PLAN.md", "docs/10-quality/TEST_PLAN.md"],
  ["templates/quality/E2E_TEST_PLAN.md", "docs/10-quality/E2E_TEST_PLAN.md"],
  ["templates/quality/API_TEST_PLAN.md", "docs/10-quality/API_TEST_PLAN.md"],
  ["templates/quality/ACCESSIBILITY_TEST_PLAN.md", "docs/10-quality/ACCESSIBILITY_TEST_PLAN.md"],
  ["templates/quality/RELEASE_QUALITY_GATE.md", "docs/10-quality/RELEASE_QUALITY_GATE.md"],

  // Performance
  ["templates/performance/PERFORMANCE_BASELINE.md", "docs/11-performance/PERFORMANCE_BASELINE.md"],
  ["templates/performance/PERFORMANCE_BUDGET.md", "docs/11-performance/PERFORMANCE_BUDGET.md"],
  ["templates/performance/PERFORMANCE_TEST_PLAN.md", "docs/11-performance/PERFORMANCE_TEST_PLAN.md"],
  ["templates/performance/PERFORMANCE_BACKLOG.md", "docs/11-performance/PERFORMANCE_BACKLOG.md"],

  // Planning
  ["templates/planning/ROADMAP.md", "docs/12-planning/ROADMAP.md"],
  ["templates/planning/SPRINT_PLAN.md", "docs/12-planning/SPRINT_PLAN.md"],
  ["templates/planning/MVP_DELIVERY_PLAN.md", "docs/12-planning/MVP_DELIVERY_PLAN.md"],
  ["templates/planning/BACKLOG.md", "docs/12-planning/BACKLOG.md"],
  ["templates/planning/DEPENDENCIES.md", "docs/12-planning/DEPENDENCIES.md"],
  ["templates/planning/DECISION_LOG.md", "docs/12-planning/DECISION_LOG.md"],

  // Business
  ["templates/business/BUSINESS_MODEL.md", "docs/13-business/BUSINESS_MODEL.md"],
  ["templates/business/PRICING.md", "docs/13-business/PRICING.md"],
  ["templates/business/GO_TO_MARKET.md", "docs/13-business/GO_TO_MARKET.md"],
  ["templates/business/EXPERIMENTS.md", "docs/13-business/EXPERIMENTS.md"],

  // Operations
  ["templates/operations/ENVIRONMENTS.md", "docs/14-operations/ENVIRONMENTS.md"],
  ["templates/operations/DEPLOYMENT.md", "docs/14-operations/DEPLOYMENT.md"],
  ["templates/operations/OBSERVABILITY.md", "docs/14-operations/OBSERVABILITY.md"],
  ["templates/operations/INCIDENT_RESPONSE.md", "docs/14-operations/INCIDENT_RESPONSE.md"],
  ["templates/operations/RUNBOOK.md", "docs/14-operations/RUNBOOK.md"]
];

for (const [template, destination] of baselineTemplates) {
  await renderTemplate(
    path.join(blueprintRoot, template),
    path.join(outputDir, destination),
    replacements
  );
}

const conditionalTemplates = [];

if (answers.isAI) {
  conditionalTemplates.push(
    ["templates/ai/AI_ARCHITECTURE.md", "docs/06-ai/AI_ARCHITECTURE.md"],
    ["templates/ai/AI_GUARDRAILS.md", "docs/06-ai/AI_GUARDRAILS.md"]
  );
}

if (
  answers.sensitiveData ||
  answers.regulated
) {
  conditionalTemplates.push(
    ["templates/privacy/PRIVACY_MODEL.md", "docs/09-privacy-governance/PRIVACY_MODEL.md"]
  );
}

for (const [template, destination] of conditionalTemplates) {
  await renderTemplate(
    path.join(blueprintRoot, template),
    path.join(outputDir, destination),
    replacements
  );
}

console.log();
console.log(chalk.green(`✓ Created project: ${slug}`));
console.log(chalk.green("✓ Created .blueprint.json"));
console.log(chalk.green("✓ Created core documentation structure"));
console.log(chalk.green("✓ Generated starter documentation"));
console.log(chalk.green("✓ Generated AGENTS.md"));

if (answers.isAI) {
  console.log(chalk.green("✓ Enabled AI documentation"));
}

console.log(
  chalk.green("✓ Enabled baseline security documentation")
);

if (
  answers.sensitiveData ||
  answers.regulated
) {
  console.log(chalk.green("✓ Enabled privacy and governance documentation"));
}

if (answers.mobile) {
  console.log(chalk.green("✓ Enabled accessibility evidence"));
}

console.log();
console.log(chalk.bold.green("Blueprint project created successfully."));
console.log();
console.log("Next:");
console.log(`  cd ${slug}`);
console.log();