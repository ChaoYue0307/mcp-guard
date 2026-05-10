#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const repoName = process.argv[2] || "mcp-guard";
const visibility = process.argv.includes("--private") ? "--private" : "--public";

run("gh", ["auth", "status"]);

const existingRemote = commandOutput("git", ["remote", "get-url", "origin"]);
if (!existingRemote.ok) {
  run("gh", [
    "repo",
    "create",
    repoName,
    visibility,
    "--source",
    ".",
    "--remote",
    "origin",
    "--push",
    "--description",
    "Open-source CLI scanner for risky MCP server and AI agent tool configuration."
  ]);
} else {
  process.stdout.write(`origin already configured: ${existingRemote.stdout.trim()}\n`);
  run("git", ["push", "-u", "origin", "main"]);
}

process.stdout.write("\nGitHub launch step completed.\n");
process.stdout.write("Next: check GitHub Actions, then publish npm with `npm publish --access public`.\n");

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

function commandOutput(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8"
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

