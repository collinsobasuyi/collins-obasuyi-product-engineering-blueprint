#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";

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

console.log();
console.log(chalk.bold.green("Blueprint configuration"));
console.log();
console.log(answers);