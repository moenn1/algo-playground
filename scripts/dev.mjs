import { spawn } from "node:child_process";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
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

for (const command of commands) {
  const child = spawn(npmCommand, command.args, {
    cwd: process.cwd(),
    env: process.env,
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

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopChildren(signal);
  });
}
