import fs from "fs-extra";
import path from "path";

import { blueprintVersion } from "./generate-project.js";
import { TEMPLATE_CHANGES } from "./template-changelog.js";

function parseVersion(version) {
  const [major, minor, patch] = String(version)
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);

  return { major, minor, patch };
}

function compareVersions(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  if (va.major !== vb.major) {
    return va.major - vb.major;
  }

  if (va.minor !== vb.minor) {
    return va.minor - vb.minor;
  }

  return va.patch - vb.patch;
}

export async function upgradeProject({ cwd = process.cwd() } = {}) {
  const blueprintConfigPath = path.join(cwd, ".blueprint.json");

  if (!(await fs.pathExists(blueprintConfigPath))) {
    throw new Error(
      "No .blueprint.json found here. Run this inside a project created with " +
        '"collins-obasuyi-blueprint init".'
    );
  }

  const config = await fs.readJson(blueprintConfigPath);
  const projectVersion = config.blueprintVersion;
  const currentVersion = blueprintVersion;

  const pendingReleases = TEMPLATE_CHANGES.filter(
    (release) =>
      compareVersions(release.version, projectVersion) > 0 &&
      compareVersions(release.version, currentVersion) <= 0
  ).sort((a, b) => compareVersions(a.version, b.version));

  const changes = pendingReleases.flatMap((release) =>
    release.changes.map((change) => ({
      ...change,
      version: release.version,
      date: release.date
    }))
  );

  return {
    project: {
      name: config.project.name,
      slug: config.project.slug
    },
    projectVersion,
    currentVersion,
    upToDate: changes.length === 0,
    changes
  };
}
