#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import { generateProject } from "../scripts/generate-project.js";

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

try {
  const result = await generateProject({
    projectName: answers.projectName,
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

  process.exit(1);
}
