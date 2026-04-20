import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const defaultDemoDataFile = path.resolve(process.cwd(), ".tracedeck", "demo-storage.json");
const commands = [
  {
    name: "api",
    args: ["run", "dev:api"]
  },
  {
    name: "web",
    args: ["run", "dev:web"]
  }
];

const children = [];
let shuttingDown = false;

function parseOptions(argv) {
  const options = {
    seedDemo: false,
    dataFile: process.env.TRACEDECK_DATA_FILE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--seed-demo") {
      options.seedDemo = true;
      continue;
    }

    if (value === "--data-file") {
      const nextValue = argv[index + 1];

      if (!nextValue) {
        throw new Error("--data-file requires a value.");
      }

      options.dataFile = path.resolve(nextValue);
      index += 1;
    }
  }

  if (options.seedDemo && !options.dataFile) {
    options.dataFile = defaultDemoDataFile;
  }

  return options;
}

function runCommand(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, args, {
      cwd: process.cwd(),
      env,
      stdio: "inherit"
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Command "${args.join(" ")}" exited with signal ${signal}.`));
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`Command "${args.join(" ")}" exited with code ${code}.`));
        return;
      }

      resolve();
    });
  });
}

function stopChildren(signal = "SIGTERM") {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopChildren(signal);
  });
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const childEnv = {
    ...process.env,
    ...(options.dataFile ? { TRACEDECK_DATA_FILE: options.dataFile } : {})
  };

  if (options.seedDemo) {
    console.log(`Seeding deterministic demo data into ${options.dataFile}.`);
    await runCommand(
      [
        "run",
        "demo:seed",
        "--",
        "--replace",
        "--data-file",
        options.dataFile
      ],
      childEnv
    );
  } else if (options.dataFile) {
    console.log(`Using TraceDeck data file ${options.dataFile}.`);
  }

  for (const command of commands) {
    const child = spawn(npmCommand, command.args, {
      cwd: process.cwd(),
      env: childEnv,
      stdio: "inherit"
    });

    child.on("exit", (code, signal) => {
      if (shuttingDown) {
        return;
      }

      if (signal) {
        stopChildren(signal);
        process.exitCode = 1;
        return;
      }

      if (code && code !== 0) {
        console.error(`${command.name} exited with code ${code}.`);
        stopChildren();
        process.exitCode = code;
      }
    });

    children.push(child);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
