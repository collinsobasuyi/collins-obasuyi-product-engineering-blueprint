#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { generateProject } from "../scripts/generate-project.js";
import { checkProject } from "../scripts/check-project.js";
import { reviewProject } from "../scripts/review-project.js";
import {
  ASSISTABLE_DOCUMENTS,
  loadAssistTarget,
  buildAssistPrompt,
  writeAssistDraft,
  findMissingSections
} from "../scripts/assist-project.js";
import { getConfiguredProvider } from "../scripts/providers/index.js";
import {
  complianceProject,
  SUPPORTED_STANDARDS
} from "../scripts/compliance-project.js";
import { upgradeProject } from "../scripts/upgrade-project.js";

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
  console.log("  collins-obasuyi-blueprint assist <document> [path]");
  console.log("  collins-obasuyi-blueprint compliance --standard=<standard> [path]");
  console.log("  collins-obasuyi-blueprint upgrade [path]");
  console.log();
  console.log("Commands:");
  console.log("  init        Create a new blueprint project");
  console.log("  check       Report completeness and readiness of a blueprint project");
  console.log("  review      Find cross-document inconsistencies in a blueprint project");
  console.log("  assist      Draft one document from the project's own context (AI-assisted)");
  console.log("  compliance  Map existing evidence against a standard (not a certification)");
  console.log("  upgrade     Report template changes since your project's blueprint version");
  console.log();
  console.log(
    `  compliance standards: ${SUPPORTED_STANDARDS.join(", ")}`
  );
  console.log();
  console.log(
    `  assist documents: ${Object.keys(ASSISTABLE_DOCUMENTS).join(", ")}`
  );
  console.log(
    "  assist requires BLUEPRINT_AI_PROVIDER + the matching API key (see"
  );
  console.log(
    "  ANTHROPIC_API_KEY / OPENAI_API_KEY) set in your environment."
  );
  console.log(
    "  assist PRODUCT_OVERVIEW reads an optional IDEA.md in your project root"
  );
  console.log(
    "  (a few sentences about what you're building) if one exists."
  );
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

async function runAssist(rest) {
  const documentName = rest[0];
  const targetDir = rest[1]
    ? path.resolve(process.cwd(), rest[1])
    : process.cwd();

  if (!documentName) {
    console.log();
    console.error(
      chalk.red(
        "Usage: collins-obasuyi-blueprint assist <document> [path]"
      )
    );
    console.log();
    console.log("Supported documents:");

    for (const key of Object.keys(ASSISTABLE_DOCUMENTS)) {
      console.log(`  ${key}`);
    }

    console.log();
    process.exitCode = 1;
    return;
  }

  let provider;

  try {
    provider = getConfiguredProvider();
  } catch (error) {
    console.log();
    console.error(chalk.red(error.message));
    process.exitCode = 1;
    return;
  }

  if (!provider) {
    console.log();
    console.log(chalk.bold("No AI provider configured."));
    console.log();
    console.log(
      'Set BLUEPRINT_AI_PROVIDER to "anthropic" or "openai", and the matching API key:'
    );
    console.log();
    console.log("  BLUEPRINT_AI_PROVIDER=anthropic");
    console.log("  ANTHROPIC_API_KEY=...");
    console.log();
    console.log("or:");
    console.log();
    console.log("  BLUEPRINT_AI_PROVIDER=openai");
    console.log("  OPENAI_API_KEY=...");
    console.log();
    console.log(
      chalk.dim(
        "Your API key stays in your local environment and is never written into project files."
      )
    );
    console.log();
    process.exitCode = 1;
    return;
  }

  let target;

  try {
    target = await loadAssistTarget({
      cwd: targetDir,
      documentName
    });
  } catch (error) {
    console.log();
    console.error(chalk.red(error.message));
    process.exitCode = 1;
    return;
  }

  console.log();
  console.log(
    chalk.bold("Collins Obasuyi Product Engineering Blueprint")
  );
  console.log();
  console.log(chalk.bold(`Project: ${target.config.project.name}`));
  console.log(`Drafting: ${target.spec.destination}`);

  if (target.hasExistingContent) {
    console.log();
    console.log(
      chalk.yellow(`${target.spec.destination} already contains content.`)
    );

    const { proceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: `Generate a draft anyway? It will be written to ${path.basename(target.draftPath)} and will not touch the existing file.`,
        default: false
      }
    ]);

    if (!proceed) {
      console.log();
      console.log("Cancelled.");
      console.log();
      return;
    }
  }

  if (!target.contextHasContent) {
    console.log();
    console.log(
      chalk.yellow(
        "This project doesn't have much content to draw from yet " +
          "(the context documents are still mostly blank)."
      )
    );
    console.log(
      chalk.yellow(
        "A draft based on this will likely come back mostly placeholder too."
      )
    );

    if (target.key === "PRODUCT_OVERVIEW") {
      console.log();
      console.log(
        chalk.dim(
          "Tip: create an IDEA.md in your project root with a few sentences " +
            "about what you're building, then try again."
        )
      );
    } else {
      console.log();
      console.log(
        chalk.dim(
          "Tip: fill in PRODUCT_OVERVIEW.md and other foundational docs " +
            "first for a better draft."
        )
      );
    }

    const { proceedAnyway } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceedAnyway",
        message: "Continue anyway?",
        default: false
      }
    ]);

    if (!proceedAnyway) {
      console.log();
      console.log("Cancelled.");
      console.log();
      return;
    }
  }

  console.log();
  console.log(
    "Drafting with AI — this calls an external API and may take a moment..."
  );

  const { system, prompt } = buildAssistPrompt(target);

  let draftContent;

  try {
    draftContent = await provider.generate({
      system,
      prompt,
      maxTokens: 4096
    });
  } catch (error) {
    console.log();
    console.error(chalk.red(error.message));
    process.exitCode = 1;
    return;
  }

  await writeAssistDraft({
    draftPath: target.draftPath,
    content: draftContent
  });

  console.log();
  console.log(
    chalk.green(
      `✓ Draft written to ${path.relative(targetDir, target.draftPath)}`
    )
  );

  const missingSections = findMissingSections(
    target.templateContent,
    draftContent
  );

  if (missingSections.length > 0) {
    console.log();
    console.log(
      chalk.yellow(
        "⚠ The draft is missing section(s) the template expects -- review carefully:"
      )
    );

    for (const heading of missingSections) {
      console.log(chalk.yellow(`  ${heading}`));
    }
  }

  console.log();
  console.log(
    "This is a draft, not a decision. Review it, then replace the original"
  );
  console.log(
    "file yourself if you're happy with it. Run check/review again"
  );
  console.log("afterward, same as you would for anything you wrote by hand.");
  console.log();
}

function formatComplianceLine(area) {
  const location = area.section
    ? `${area.file} § ${area.section}`
    : area.file;

  if (area.status === "complete") {
    return chalk.green(`✓ ${area.area} — ${location}`);
  }

  if (area.status === "todo") {
    return chalk.yellow(
      `⚠ ${area.area} — ${location} (evidence incomplete)`
    );
  }

  if (area.status === "no-document") {
    return chalk.red(
      `✗ ${area.area} — ${location} (document not present in this project)`
    );
  }

  return chalk.red(`✗ ${area.area} — ${location} (no evidence yet)`);
}

async function runCompliance(rest) {
  let standard;
  let pathArg;

  for (const arg of rest) {
    if (arg.startsWith("--standard=")) {
      standard = arg.slice("--standard=".length);
    } else if (!arg.startsWith("--")) {
      pathArg = arg;
    }
  }

  const targetDir = pathArg
    ? path.resolve(process.cwd(), pathArg)
    : process.cwd();

  if (!standard) {
    console.log();
    console.error(
      chalk.red(
        "Usage: collins-obasuyi-blueprint compliance --standard=<standard> [path]"
      )
    );
    console.log();
    console.log(`Supported standards: ${SUPPORTED_STANDARDS.join(", ")}`);
    console.log();
    process.exitCode = 1;
    return;
  }

  try {
    const report = await complianceProject({
      cwd: targetDir,
      standard
    });

    console.log();
    console.log(
      chalk.bold("Collins Obasuyi Product Engineering Blueprint")
    );
    console.log();
    console.log(chalk.bold(`Project: ${report.project.name}`));
    console.log(`Standard: ${report.label}`);
    console.log();

    for (const area of report.areas) {
      console.log(formatComplianceLine(area));
    }

    console.log();
    console.log(chalk.bold(`COVERAGE: ${report.summary.coverage}%`));
    console.log();
    console.log(
      chalk.dim(
        "This is an evidence-readiness report, not a compliance certification."
      )
    );
    console.log();
  } catch (error) {
    console.log();
    console.error(chalk.red(error.message));
    process.exitCode = 1;
  }
}

async function runUpgrade(rest) {
  const targetDir = rest[0]
    ? path.resolve(process.cwd(), rest[0])
    : process.cwd();

  try {
    const report = await upgradeProject({ cwd: targetDir });

    console.log();
    console.log(
      chalk.bold("Collins Obasuyi Product Engineering Blueprint")
    );
    console.log();
    console.log(chalk.bold(`Project: ${report.project.name}`));
    console.log(`Project blueprint: ${report.projectVersion}`);
    console.log(`Current blueprint: ${report.currentVersion}`);
    console.log();

    if (report.upToDate) {
      console.log(
        chalk.green(
          "✓ Up to date — no template changes since this project was generated."
        )
      );
      console.log();
      return;
    }

    console.log(chalk.bold("Template changes since this project's version:"));
    console.log();

    for (const change of report.changes) {
      console.log(chalk.yellow(`~ [${change.version}] ${change.file}`));
      console.log(`  ${change.description}`);
      console.log();
    }

    console.log(
      "Nothing has been modified. This is based on your project's recorded"
    );
    console.log(
      "blueprint version, not its actual content -- you may have already"
    );
    console.log(
      "applied some of these by hand. Apply what's relevant yourself, the"
    );
    console.log("same way you would any other documentation change.");
    console.log();
  } catch (error) {
    console.log();
    console.error(chalk.red(error.message));
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
} else if (command === "assist") {
  await runAssist(rest);
} else if (command === "compliance") {
  await runCompliance(rest);
} else if (command === "upgrade") {
  await runUpgrade(rest);
} else {
  console.log();
  console.error(chalk.red(`Unknown command: ${command}`));
  printHelp();
  process.exit(1);
}
