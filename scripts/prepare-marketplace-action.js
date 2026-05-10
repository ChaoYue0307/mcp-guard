#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, "dist", "mcp-guard-action");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

copyFile("action.yml", "action.yml");
copyFile("LICENSE", "LICENSE");
copyFile("docs/marketplace-action-readme.md", "README.md");
copyDir("bin", "bin");
copyDir("src", "src");
copyFile("scripts/action-summary.js", "scripts/action-summary.js");
copyFile("scripts/action-comment.js", "scripts/action-comment.js");
writePackageJson();
validateExport();

process.stdout.write(`Marketplace action package prepared at ${path.relative(root, outputDir)}\n`);

function copyFile(from, to) {
  const source = path.join(root, from);
  const target = path.join(outputDir, to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(from, to) {
  fs.cpSync(path.join(root, from), path.join(outputDir, to), {
    recursive: true,
    filter: (source) => !source.includes(`${path.sep}.DS_Store`)
  });
}

function writePackageJson() {
  const actionPackage = {
    name: "mcp-guard-action",
    version: packageJson.version,
    private: true,
    description: "GitHub Action wrapper for mcp-guard MCP and AI agent security scanning.",
    type: "module",
    engines: packageJson.engines,
    license: packageJson.license
  };

  fs.writeFileSync(path.join(outputDir, "package.json"), `${JSON.stringify(actionPackage, null, 2)}\n`, "utf8");
}

function validateExport() {
  const required = [
    "action.yml",
    "README.md",
    "LICENSE",
    "package.json",
    "bin/mcp-guard.js",
    "src/audit.js",
    "src/cli.js",
    "src/policy.js",
    "src/report.js",
    "scripts/action-summary.js",
    "scripts/action-comment.js"
  ];

  const missing = required.filter((file) => !fs.existsSync(path.join(outputDir, file)));
  if (missing.length > 0) {
    throw new Error(`Marketplace export is missing: ${missing.join(", ")}`);
  }

  if (fs.existsSync(path.join(outputDir, ".github"))) {
    throw new Error("Marketplace export must not include .github workflows.");
  }
}
