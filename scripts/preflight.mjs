import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

const syntaxTargets = [
  "scripts/dev.mjs",
  "scripts/preflight.mjs",
  "apps/api/src/server.ts",
  "apps/api/test/server.test.ts",
  "apps/web/src/replay.ts",
  "packages/trace-core/src/schema.ts",
  "packages/trace-core/test/schema.test.ts"
];

const requiredDocs = [
  "docs/product-overview.md",
  "docs/architecture.md",
  "docs/trace-contract.md",
  "docs/roadmap.md",
  "docs/quality-baseline.md",
  "docs/testing-strategy.md",
  "docs/contribution-standards.md",
  "docs/diagrams.md"
];

function fail(message) {
  console.error(`Preflight failed: ${message}`);
  process.exit(1);
}

function assertFileExists(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  if (!existsSync(absolutePath)) {
    fail(`missing required file ${relativePath}`);
  }
}

for (const relativePath of [...syntaxTargets, ...requiredDocs]) {
  assertFileExists(relativePath);
}

for (const relativePath of syntaxTargets) {
  const result = spawnSync(process.execPath, ["--check", relativePath], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    fail(`syntax check failed for ${relativePath}\n${result.stderr || result.stdout}`);
  }
}

const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const requiredScripts = ["preflight", "check", "smoke", "verify:contracts"];

for (const scriptName of requiredScripts) {
  if (!packageJson.scripts?.[scriptName]) {
    fail(`package.json is missing the "${scriptName}" script`);
  }
}

if (packageJson.engines?.node === undefined || packageJson.engines?.npm === undefined) {
  fail("package.json must declare supported Node.js and npm engine ranges");
}

const readme = readFileSync(path.join(repoRoot, "README.md"), "utf8");

for (const docPath of requiredDocs) {
  if (!readme.includes(docPath)) {
    fail(`README.md must reference ${docPath}`);
  }
}

console.log("TraceDeck preflight passed.");
