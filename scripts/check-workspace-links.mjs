import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const INTERNAL_SCOPE = "@tracedeck/";
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function toPosixRelativePath(rootDir, targetPath) {
  return path.relative(rootDir, targetPath).split(path.sep).join("/");
}

function expandWorkspacePattern(rootDir, pattern) {
  if (!pattern.includes("*")) {
    return existsSync(path.join(rootDir, pattern, "package.json")) ? [pattern] : [];
  }

  if (!pattern.endsWith("/*")) {
    throw new Error(`Unsupported workspace pattern: ${pattern}`);
  }

  const basePattern = pattern.slice(0, -2);
  const baseDir = path.join(rootDir, basePattern);

  if (!existsSync(baseDir)) {
    return [];
  }

  return readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.posix.join(basePattern, entry.name))
    .filter((workspaceDir) =>
      existsSync(path.join(rootDir, workspaceDir, "package.json"))
    );
}

function loadWorkspaceInfos(rootDir) {
  const rootPackage = readJson(path.join(rootDir, "package.json"));
  const workspacePatterns = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : [];
  const workspaceDirs = workspacePatterns.flatMap((pattern) =>
    expandWorkspacePattern(rootDir, pattern)
  );

  return workspaceDirs
    .map((workspaceDir) => ({
      dir: workspaceDir,
      packageJson: readJson(path.join(rootDir, workspaceDir, "package.json"))
    }))
    .sort((left, right) => left.dir.localeCompare(right.dir));
}

function collectInternalDependencyRefs(workspaceInfos) {
  return workspaceInfos.flatMap((workspace) =>
    DEPENDENCY_FIELDS.flatMap((field) =>
      Object.entries(workspace.packageJson[field] ?? {})
        .filter(([dependencyName]) => dependencyName.startsWith(INTERNAL_SCOPE))
        .map(([dependencyName, range]) => ({
          workspaceDir: workspace.dir,
          field,
          dependencyName,
          range
        }))
    )
  );
}

function validateWorkspaceLinks(rootDir, workspaceInfos, dependencyRefs) {
  const failures = [];
  const workspaceNameToDir = new Map(
    workspaceInfos.map((workspace) => [workspace.packageJson.name, workspace.dir])
  );
  const lockfilePath = path.join(rootDir, "package-lock.json");

  if (!existsSync(lockfilePath)) {
    failures.push(
      "Missing package-lock.json. Run npm install so workspace link metadata is materialized."
    );
    return failures;
  }

  const lockfile = readJson(lockfilePath);
  const lockPackages = lockfile.packages ?? {};

  for (const ref of dependencyRefs) {
    if (!workspaceNameToDir.has(ref.dependencyName)) {
      failures.push(
        `${ref.workspaceDir} ${ref.field} declares ${ref.dependencyName}@${ref.range}, but no matching workspace package exists.`
      );
    }
  }

  for (const workspace of workspaceInfos) {
    const workspaceName = workspace.packageJson.name;

    if (!workspaceName || typeof workspaceName !== "string") {
      failures.push(`${workspace.dir} is missing a valid package name.`);
      continue;
    }

    const workspaceRelativePath = toPosixRelativePath(
      rootDir,
      path.join(rootDir, workspace.dir)
    );
    const lockWorkspaceEntry = lockPackages[workspaceRelativePath];

    if (!lockWorkspaceEntry) {
      failures.push(
        `package-lock.json is missing the workspace entry for ${workspaceName} at ${workspaceRelativePath}.`
      );
    } else if (lockWorkspaceEntry.name !== workspaceName) {
      failures.push(
        `package-lock.json records ${workspaceRelativePath} as ${lockWorkspaceEntry.name ?? "<unnamed>"}, expected ${workspaceName}.`
      );
    }

    if (!workspaceName.startsWith(INTERNAL_SCOPE)) {
      continue;
    }

    const nodeModulesKey = path.posix.join("node_modules", ...workspaceName.split("/"));
    const nodeModulesEntry = lockPackages[nodeModulesKey];

    if (!nodeModulesEntry) {
      failures.push(
        `package-lock.json is missing the node_modules link entry for ${workspaceName}.`
      );
    } else {
      if (nodeModulesEntry.link !== true) {
        failures.push(`package-lock.json does not mark ${workspaceName} as a linked workspace.`);
      }

      if (nodeModulesEntry.resolved !== workspaceRelativePath) {
        failures.push(
          `package-lock.json resolves ${workspaceName} to ${nodeModulesEntry.resolved ?? "<missing>"}, expected ${workspaceRelativePath}.`
        );
      }
    }

    const nodeModulesPath = path.join(rootDir, "node_modules", ...workspaceName.split("/"));

    if (!existsSync(nodeModulesPath)) {
      failures.push(`node_modules is missing the linked workspace package ${workspaceName}.`);
      continue;
    }

    const stats = lstatSync(nodeModulesPath);

    if (!stats.isSymbolicLink()) {
      failures.push(`${workspaceName} is present in node_modules but is not linked.`);
      continue;
    }

    const expectedRealPath = path.resolve(rootDir, workspace.dir);
    const actualRealPath = realpathSync(nodeModulesPath);

    if (actualRealPath !== expectedRealPath) {
      failures.push(
        `${workspaceName} points to ${toPosixRelativePath(rootDir, actualRealPath)}, expected ${workspaceRelativePath}.`
      );
    }
  }

  return failures;
}

function main() {
  const rootDir = process.cwd();
  const workspaceInfos = loadWorkspaceInfos(rootDir);
  const dependencyRefs = collectInternalDependencyRefs(workspaceInfos);
  const failures = validateWorkspaceLinks(rootDir, workspaceInfos, dependencyRefs);

  if (failures.length > 0) {
    console.error("workspace:check failed.");
    console.error("");
    console.error("Detected workspace integrity issues:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  const linkedWorkspaces = workspaceInfos
    .map((workspace) => workspace.packageJson.name)
    .filter((name) => typeof name === "string" && name.startsWith(INTERNAL_SCOPE))
    .sort();

  console.log("workspace:check passed.");
  console.log("");
  console.log(`Workspaces inspected: ${workspaceInfos.length}`);
  console.log(`Internal workspace references: ${dependencyRefs.length}`);
  console.log("Linked internal workspaces:");
  for (const workspaceName of linkedWorkspaces) {
    console.log(`- ${workspaceName}`);
  }
}

main();
