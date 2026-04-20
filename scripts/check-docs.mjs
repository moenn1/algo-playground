import { execFileSync } from "node:child_process";
import process from "node:process";

const EMPTY_TREE_SHA = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
const IMPLEMENTATION_PREFIXES = ["apps/", "packages/", "scripts/", ".github/workflows/"];
const IMPLEMENTATION_FILES = new Set([
  ".gitignore",
  ".nvmrc",
  "eslint.config.js",
  "package.json",
  "tsconfig.base.json"
]);
const DOCUMENTATION_PREFIXES = ["docs/"];
const DOCUMENTATION_FILES = new Set(["README.md", "CHANGELOG.md"]);

function printUsage() {
  console.log(`Usage: node scripts/check-docs.mjs [--base <sha>] [--head <sha>] [--file <path> ...]

Checks that implementation or workflow changes also update CHANGELOG.md and at least one
repository-facing documentation file in README.md or docs/.`);
}

function parseArgs(argv) {
  const options = {
    base: null,
    head: "HEAD",
    files: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--help" || value === "-h") {
      printUsage();
      process.exit(0);
    }

    if (value === "--base") {
      const nextValue = argv[index + 1];

      if (!nextValue) {
        throw new Error("--base requires a git revision.");
      }

      options.base = nextValue;
      index += 1;
      continue;
    }

    if (value === "--head") {
      const nextValue = argv[index + 1];

      if (!nextValue) {
        throw new Error("--head requires a git revision.");
      }

      options.head = nextValue;
      index += 1;
      continue;
    }

    if (value === "--file") {
      const nextValue = argv[index + 1];

      if (!nextValue) {
        throw new Error("--file requires a path.");
      }

      options.files.push(nextValue);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return options;
}

function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function resolveDefaultBase() {
  try {
    return runGit(["rev-parse", "--verify", "HEAD^"]);
  } catch {
    return EMPTY_TREE_SHA;
  }
}

function resolveChangedFiles({ base, head, files }) {
  if (files.length > 0) {
    return [...new Set(files)].sort();
  }

  const resolvedBase = base ?? resolveDefaultBase();
  const output = runGit([
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    resolvedBase,
    head
  ]);

  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean)
    .sort();
}

function isImplementationFile(file) {
  if (IMPLEMENTATION_FILES.has(file)) {
    return true;
  }

  return IMPLEMENTATION_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function isDocumentationFile(file) {
  if (DOCUMENTATION_FILES.has(file)) {
    return true;
  }

  return DOCUMENTATION_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const changedFiles = resolveChangedFiles(options);

  if (changedFiles.length === 0) {
    console.log("docs:check passed: no changed files detected.");
    return;
  }

  const implementationFiles = changedFiles.filter(isImplementationFile);

  if (implementationFiles.length === 0) {
    console.log("docs:check passed: no implementation or workflow changes detected.");
    return;
  }

  const documentationFiles = changedFiles.filter(isDocumentationFile);
  const hasChangelog = documentationFiles.includes("CHANGELOG.md");
  const hasReferenceDocs = documentationFiles.some((file) => file !== "CHANGELOG.md");

  if (!hasChangelog || !hasReferenceDocs) {
    console.error("docs:check failed.");
    console.error("");
    console.error("Implementation or workflow changes require:");
    console.error("- CHANGELOG.md");
    console.error("- README.md or a file under docs/");
    console.error("");
    console.error("Implementation changes:");
    for (const file of implementationFiles) {
      console.error(`- ${file}`);
    }

    console.error("");
    console.error("Documentation changes detected:");
    for (const file of documentationFiles) {
      console.error(`- ${file}`);
    }

    process.exit(1);
  }

  console.log("docs:check passed.");
  console.log("");
  console.log("Implementation changes:");
  for (const file of implementationFiles) {
    console.log(`- ${file}`);
  }

  console.log("");
  console.log("Documentation changes:");
  for (const file of documentationFiles) {
    console.log(`- ${file}`);
  }
}

main();
