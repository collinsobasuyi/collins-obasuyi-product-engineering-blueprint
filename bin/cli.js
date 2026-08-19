#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { generateProject } from "../scripts/generate-project.js";
import { checkProject } from "../scripts/check-project.js";
import { reviewProject } from "../scripts/review-project.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blueprintRoot = path.resolve(__dirname, "..");

const packageJson = await fs.readJson(
  path.join(blueprintRoot, "package.json")
);

function printHelp() {
  console.log();
  console.log(chalk.bold("Collins Obasuyi Product Engineering Blueprint"));
  console.log();
  console.log("Usage:");
  console.log("  collins-obasuyi-blueprint init [project-name]");
  console.log("  collins-obasuyi-blueprint check [path]");
  console.log("  collins-obasuyi-blueprint review [path]");
  console.log();
  console.log("Commands:");
  console.log("  init       Create a new blueprint project");
  console.log("  check      Report completeness and readiness of a blueprint project");
  console.log("  review     Find cross-document inconsistencies in a blueprint project");
  console.log();
  console.log("Options:");
  console.log("  --help     Show help");
  console.log("  --version  Show version");
  console.log();
}

function printVersion() {
  console.log(packageJson.version);
}

async function runInit(rest) {
  const projectNameArg = rest[0];

  console.log();
  console.log(
    chalk.bold("Collins Obasuyi Product Engineering Blueprint")
  );
  console.log(
    chalk.dim("From idea to secure, tested, production-ready software.")
  );
  console.log();

  const prompts = [];

  if (!projectNameArg) {
    prompts.push({
      type: "input",
      name: "projectName",
      message: "Project name?",
      validate(value) {
        if (!value.trim()) {
          return "Please enter a project name.";
        }

        return true;
      }
    });
  } else {
    console.log(chalk.bold(`Project: ${projectNameArg}`));
    console.log();
  }

  prompts.push(
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
  );

  const answers = await inquirer.prompt(prompts);

  const projectName = projectNameArg || answers.projectName;

  try {
    const result = await generateProject({
      projectName,
      isAI: answers.isAI,
      sensitiveData: answers.sensitiveData,
      authentication: answers.authentication,
      integrations: answers.integrations,
      regulated: answers.regulated,
      mobile: answers.mobile
    });

    console.log();

    console.log(
      chalk.green(
        `✓ Created project: ${result.slug}`
      )
    );

    console.log(
      chalk.green(
        "✓ Generated blueprint documentation"
      )
    );

    console.log();

    console.log(
      chalk.bold.green(
        "Blueprint project created successfully."
      )
    );

    console.log();

    console.log("Next:");
    console.log(
      `  cd ${result.slug}`
    );

    console.log();
  } catch (error) {
    console.log();

    console.error(
      chalk.red(error.message)
    );

    process.exitCode = 1;
  }
}

function formatDocumentLine(document) {
  if (document.status === "complete") {
    return chalk.green(`✓ ${document.title}`);
  }

  if (document.status === "todo") {
    const count = document.unresolvedCount;

    return chalk.yellow(
      `⚠ ${document.title} contains ${count} TODO${count === 1 ? "" : "s"}`
    );
  }

  if (document.status === "missing") {
    return chalk.red(`✗ ${document.title} is missing`);
  }

  return chalk.red(`✗ ${document.title} not started`);
}

function pluralize(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

async function runCheck(rest) {
  const targetDir = rest[0]
    ? path.resolve(process.cwd(), rest[0])
    : process.cwd();

  try {
    const report = await checkProject({ cwd: targetDir });

    console.log();
    console.log(
      chalk.bold("Collins Obasuyi Product Engineering Blueprint")
    );
    console.log();
    console.log(chalk.bold(`Project: ${report.project.name}`));

    for (const category of report.categories) {
      console.log();
      console.log(chalk.bold(category.label.toUpperCase()));

      for (const document of category.documents) {
        console.log(formatDocumentLine(document));
      }
    }

    console.log();
    console.log(chalk.bold(`READINESS: ${report.summary.readiness}%`));
    console.log();
    console.log(pluralize(report.summary.blockers, "blocker"));
    console.log(
      pluralize(report.summary.incompleteDocuments, "incomplete document")
    );
    console.log(
      pluralize(report.summary.unresolvedTodos, "unresolved TODO")
    );
    console.log();

    process.exitCode = report.summary.blockers > 0 ? 1 : 0;
  } catch (error) {
    console.log();

    console.error(
      chalk.red(error.message)
    );

    process.exitCode = 1;
  }
}

async function runReview(rest) {
  const targetDir = rest[0]
    ? path.resolve(process.cwd(), rest[0])
    : process.cwd();

  try {
    const report = await reviewProject({ cwd: targetDir });

    console.log();
    console.log(
      chalk.bold("Collins Obasuyi Product Engineering Blueprint")
    );
    console.log();
    console.log(chalk.bold(`Project: ${report.project.name}`));
    console.log();
    console.log(chalk.bold("REVIEW"));
    console.log();

    if (report.findings.length === 0) {
      console.log(chalk.green("✓ No consistency issues found."));
    } else {
      for (const finding of report.findings) {
        console.log(chalk.yellow(`⚠ ${finding.message}`));
      }
    }

    console.log();
    console.log(pluralize(report.summary.totalFindings, "finding"));
    console.log();

    process.exitCode = report.summary.totalFindings > 0 ? 1 : 0;
  } catch (error) {
    console.log();

    console.error(
      chalk.red(error.message)
    );

    process.exitCode = 1;
  }
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  printVersion();
  process.exit(0);
}

const [command, ...rest] = args;

if (!command) {
  printHelp();
  process.exit(0);
}

if (command === "init") {
  await runInit(rest);
} else if (command === "check") {
  await runCheck(rest);
} else if (command === "review") {
  await runReview(rest);
} else {
  console.log();
  console.error(chalk.red(`Unknown command: ${command}`));
  printHelp();
  process.exit(1);
}
