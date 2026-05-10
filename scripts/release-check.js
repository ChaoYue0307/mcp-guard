#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, ".release-check");
const sampleReportPath = path.join(outputDir, "sample-report.md");
const sampleHtmlReportPath = path.join(outputDir, "sample-report.html");

fs.mkdirSync(outputDir, { recursive: true });

const checks = [
  {
    name: "tests",
    command: process.execPath,
    args: ["--test"]
  },
  {
    name: "unsafe example scan",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "examples/unsafe-claude_desktop_config.json",
      "--format",
      "markdown",
      "--output",
      sampleReportPath
    ]
  },
  {
    name: "safe example scan",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "examples/safe-claude_desktop_config.json"
    ]
  },
  {
    name: "unsafe example html report",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "examples/unsafe-claude_desktop_config.json",
      "--format",
      "html",
      "--output",
      sampleHtmlReportPath
    ]
  },
  {
    name: "npm pack dry run",
    command: "npm",
    args: ["--cache", "./.npm-cache", "pack", "--dry-run"]
  }
];

for (const check of checks) {
  process.stdout.write(`\n==> ${check.name}\n`);
  const result = spawnSync(check.command, check.args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.stderr.write(`\nrelease-check failed at: ${check.name}\n`);
    process.exit(result.status ?? 1);
  }
}

const report = fs.readFileSync(sampleReportPath, "utf8");
const required = ["MCP010", "MCP021", "MCP030", "MCP041", "MCP061"];
const missing = required.filter((item) => !report.includes(item));

if (missing.length > 0) {
  process.stderr.write(`sample report is missing expected rules: ${missing.join(", ")}\n`);
  process.exit(1);
}

const htmlReport = fs.readFileSync(sampleHtmlReportPath, "utf8");
const htmlRequired = ["<!doctype html>", "Risk score", "MCP010", "MCP061"];
const htmlMissing = htmlRequired.filter((item) => !htmlReport.includes(item));

if (htmlMissing.length > 0) {
  process.stderr.write(`HTML report is missing expected content: ${htmlMissing.join(", ")}\n`);
  process.exit(1);
}

const leakedSecrets = ["exampleSecretValue", "example-secret-token"].filter((item) => htmlReport.includes(item));

if (leakedSecrets.length > 0) {
  process.stderr.write(`HTML report leaked secret-like sample values: ${leakedSecrets.join(", ")}\n`);
  process.exit(1);
}

process.stdout.write("\nrelease-check passed\n");
