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
  "docs/10-quality",
  "docs/11-performance",
  "docs/12-planning",
  "docs/13-business",
  "docs/14-operations",
  "docs/15-evidence/releases"
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
  answers.authentication ||
  answers.isAI ||
  answers.sensitiveData ||
  answers.integrations
) {
  await fs.ensureDir(
    path.join(outputDir, "docs/08-security")
  );

  await fs.ensureDir(
    path.join(outputDir, "docs/15-evidence/security")
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

await renderTemplate(
  path.join(blueprintRoot, "templates/core/AGENTS.md"),
  path.join(outputDir, "AGENTS.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/core/README.md"),
  path.join(outputDir, "README.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/product/PRODUCT_OVERVIEW.md"),
  path.join(outputDir, "docs/00-product/PRODUCT_OVERVIEW.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/product/MVP_SCOPE.md"),
  path.join(outputDir, "docs/00-product/MVP_SCOPE.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/product/PRODUCT_PRINCIPLES.md"),
  path.join(outputDir, "docs/00-product/PRODUCT_PRINCIPLES.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/architecture/SYSTEM_ARCHITECTURE.md"),
  path.join(outputDir, "docs/05-architecture/SYSTEM_ARCHITECTURE.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/quality/TEST_STRATEGY.md"),
  path.join(outputDir, "docs/10-quality/TEST_STRATEGY.md"),
  replacements
);

await renderTemplate(
  path.join(blueprintRoot, "templates/planning/SPRINT_PLAN.md"),
  path.join(outputDir, "docs/12-planning/SPRINT_PLAN.md"),
  replacements
);

if (
  answers.authentication ||
  answers.isAI ||
  answers.sensitiveData ||
  answers.integrations
) {
  await renderTemplate(
    path.join(blueprintRoot, "templates/security/SECURITY_BASELINE.md"),
    path.join(outputDir, "docs/08-security/SECURITY_BASELINE.md"),
    replacements
  );
}

if (answers.isAI) {
  await renderTemplate(
    path.join(blueprintRoot, "templates/ai/AI_ARCHITECTURE.md"),
    path.join(outputDir, "docs/06-ai/AI_ARCHITECTURE.md"),
    replacements
  );

  await renderTemplate(
    path.join(blueprintRoot, "templates/ai/AI_GUARDRAILS.md"),
    path.join(outputDir, "docs/06-ai/AI_GUARDRAILS.md"),
    replacements
  );
}

if (
  answers.sensitiveData ||
  answers.regulated
) {
  await renderTemplate(
    path.join(blueprintRoot, "templates/privacy/PRIVACY_MODEL.md"),
    path.join(outputDir, "docs/09-privacy-governance/PRIVACY_MODEL.md"),
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

if (
  answers.authentication ||
  answers.isAI ||
  answers.sensitiveData ||
  answers.integrations
) {
  console.log(chalk.green("✓ Enabled security documentation"));
}

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