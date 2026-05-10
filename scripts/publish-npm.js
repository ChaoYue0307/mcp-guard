#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const packageName = "agent-mcp-guard";
const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
const packageVersion = packageJson.version;

run("npm", ["whoami"]);
run("npm", ["run", "release:check"]);

const view = spawnSync("npm", ["--cache", "./.npm-cache", "view", `${packageName}@${packageVersion}`, "version"], {
  encoding: "utf8"
});

if (view.status === 0) {
  process.stderr.write(`${packageName}@${packageVersion} already exists on npm.\n`);
  process.stderr.write("Bump package.json version before publishing a new release.\n");
  process.exit(1);
}

if (!view.stderr.includes("E404")) {
  process.stderr.write(view.stderr);
  process.stderr.write("Could not confirm npm package availability.\n");
  process.exit(view.status ?? 1);
}

run("npm", ["--cache", "./.npm-cache", "publish", "--access", "public"]);

process.stdout.write(`\nPublished ${packageName}@${packageVersion}.\n`);
process.stdout.write("Install test: npm install -g agent-mcp-guard && mcp-guard scan\n");

function run(command, args) {
  process.stdout.write(`\n$ ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
