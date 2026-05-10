#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, ".release-check");
const sampleReportPath = path.join(outputDir, "sample-report.md");
const sampleHtmlReportPath = path.join(outputDir, "sample-report.html");
const sampleJsonReportPath = path.join(outputDir, "sample-report.json");
const policyJsonReportPath = path.join(outputDir, "policy-report.json");
const sampleSarifReportPath = path.join(outputDir, "mcp-guard.sarif");
const e2eJsonReportPath = path.join(outputDir, "e2e-report.json");
const auditOutputDir = path.join(outputDir, "audit-pack");

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
    name: "unsafe example json report",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "examples/unsafe-claude_desktop_config.json",
      "--format",
      "json",
      "--output",
      sampleJsonReportPath
    ]
  },
  {
    name: "unsafe example sarif report",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "examples/unsafe-claude_desktop_config.json",
      "--format",
      "sarif",
      "--output",
      sampleSarifReportPath
    ]
  },
  {
    name: "unsafe example policy report",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "examples/unsafe-claude_desktop_config.json",
      "--policy",
      "examples/mcp-guard-policy.json",
      "--format",
      "json",
      "--output",
      policyJsonReportPath
    ]
  },
  {
    name: "unsafe example audit pack",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "audit",
      "--config",
      "examples/unsafe-claude_desktop_config.json",
      "--policy",
      "examples/mcp-guard-policy.json",
      "--output-dir",
      auditOutputDir,
      "--fail-on",
      "none"
    ]
  },
  {
    name: "site e2e example json report",
    command: process.execPath,
    args: [
      "bin/mcp-guard.js",
      "scan",
      "--config",
      "site/e2e/claude_desktop_config.json",
      "--format",
      "json",
      "--output",
      e2eJsonReportPath
    ]
  },
  {
    name: "npm pack dry run",
    command: "npm",
    args: ["--cache", "./.npm-cache", "pack", "--dry-run"]
  },
  {
    name: "marketplace action package",
    command: process.execPath,
    args: ["scripts/prepare-marketplace-action.js"]
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

const sarifReport = JSON.parse(fs.readFileSync(sampleSarifReportPath, "utf8"));
const sarifResults = sarifReport.runs?.[0]?.results || [];
const sarifRules = sarifReport.runs?.[0]?.tool?.driver?.rules || [];

if (sarifReport.version !== "2.1.0" || sarifResults.length === 0 || !sarifRules.some((rule) => rule.id === "MCP010")) {
  process.stderr.write("SARIF report is missing expected version, results, or rules.\n");
  process.exit(1);
}

const sarifText = JSON.stringify(sarifReport);
const sarifLeaks = ["exampleSecretValue", "example-secret-token"].filter((item) => sarifText.includes(item));

if (sarifLeaks.length > 0) {
  process.stderr.write(`SARIF report leaked secret-like sample values: ${sarifLeaks.join(", ")}\n`);
  process.exit(1);
}

const e2eReport = JSON.parse(fs.readFileSync(e2eJsonReportPath, "utf8"));
const e2eSummary = e2eReport.summary || {};
const e2eExpected = [
  e2eSummary.serverCount === 3,
  e2eSummary.findingCount === 9,
  e2eSummary.riskScore === 98,
  e2eSummary.counts?.critical === 2,
  e2eSummary.counts?.high === 5,
  e2eSummary.counts?.medium === 2
];

if (!e2eExpected.every(Boolean)) {
  process.stderr.write("E2E example no longer matches the documented summary.\n");
  process.exit(1);
}

const policyReport = JSON.parse(fs.readFileSync(policyJsonReportPath, "utf8"));
const policyIds = new Set((policyReport.findings || []).map((finding) => finding.id));
const policyRequired = ["MCP070", "MCP071", "MCP072", "MCP073", "MCP074"];
const policyMissing = policyRequired.filter((item) => !policyIds.has(item));

if (!policyReport.metadata?.policyEnabled || policyMissing.length > 0) {
  process.stderr.write(`Policy report is missing expected policy enforcement: ${policyMissing.join(", ")}\n`);
  process.exit(1);
}

const auditFiles = [
  "mcp-guard-executive-summary.md",
  "mcp-guard-remediation.md",
  "mcp-guard-report.md",
  "mcp-guard-report.html",
  "mcp-guard-report.json",
  "mcp-guard.sarif",
  "mcp-guard-audit-manifest.json"
];
const missingAuditFiles = auditFiles.filter((file) => !fs.existsSync(path.join(auditOutputDir, file)));

if (missingAuditFiles.length > 0) {
  process.stderr.write(`audit pack is missing expected files: ${missingAuditFiles.join(", ")}\n`);
  process.exit(1);
}

const auditManifest = JSON.parse(fs.readFileSync(path.join(auditOutputDir, "mcp-guard-audit-manifest.json"), "utf8"));
const auditRemediation = fs.readFileSync(path.join(auditOutputDir, "mcp-guard-remediation.md"), "utf8");
const auditSummary = fs.readFileSync(path.join(auditOutputDir, "mcp-guard-executive-summary.md"), "utf8");

if (auditManifest.summary?.riskScore !== 100 || !auditManifest.policy?.path || !auditRemediation.includes("MCP070") || !auditSummary.includes("Risk score: **100**")) {
  process.stderr.write("audit pack is missing expected policy, risk, or remediation content.\n");
  process.exit(1);
}

const auditLeaks = ["exampleSecretValue", "example-secret-token"].filter((item) =>
  auditRemediation.includes(item) || auditSummary.includes(item)
);

if (auditLeaks.length > 0) {
  process.stderr.write(`audit pack leaked secret-like sample values: ${auditLeaks.join(", ")}\n`);
  process.exit(1);
}

const summary = spawnSync(process.execPath, [
  "scripts/action-summary.js",
  sampleJsonReportPath,
  sampleReportPath,
  sampleHtmlReportPath,
  sampleSarifReportPath,
  "high",
  path.join(auditOutputDir, "mcp-guard-executive-summary.md"),
  path.join(auditOutputDir, "mcp-guard-remediation.md"),
  path.join(auditOutputDir, "mcp-guard-audit-manifest.json")
], {
  cwd: root,
  encoding: "utf8"
});

if (summary.status !== 0 || !summary.stdout.includes("Risk score: **98**") || !summary.stdout.includes("SARIF") || !summary.stdout.includes("Executive summary") || !summary.stdout.includes("Remediation") || !summary.stdout.includes("Audit manifest")) {
  process.stderr.write("action summary generation failed or missed expected content.\n");
  process.stderr.write(summary.stderr);
  process.exit(summary.status ?? 1);
}

const comment = spawnSync(process.execPath, [
  "scripts/action-comment.js",
  sampleJsonReportPath,
  sampleReportPath,
  sampleHtmlReportPath,
  sampleSarifReportPath,
  "high",
  path.join(auditOutputDir, "mcp-guard-executive-summary.md"),
  path.join(auditOutputDir, "mcp-guard-remediation.md"),
  path.join(auditOutputDir, "mcp-guard-audit-manifest.json")
], {
  cwd: root,
  encoding: "utf8"
});

if (comment.status !== 0 || !comment.stdout.includes("<!-- mcp-guard-comment -->") || !comment.stdout.includes("Top active findings") || !comment.stdout.includes("Executive summary") || !comment.stdout.includes("Audit manifest")) {
  process.stderr.write("PR comment generation failed or missed expected content.\n");
  process.stderr.write(comment.stderr);
  process.exit(comment.status ?? 1);
}

const policySummary = spawnSync(process.execPath, [
  "scripts/action-summary.js",
  policyJsonReportPath,
  sampleReportPath,
  sampleHtmlReportPath,
  sampleSarifReportPath,
  "high"
], {
  cwd: root,
  encoding: "utf8"
});

if (policySummary.status !== 0 || !policySummary.stdout.includes("Policy: **examples/mcp-guard-policy.json**")) {
  process.stderr.write("policy action summary generation failed or missed policy context.\n");
  process.stderr.write(policySummary.stderr);
  process.exit(policySummary.status ?? 1);
}

const policyComment = spawnSync(process.execPath, [
  "scripts/action-comment.js",
  policyJsonReportPath,
  sampleReportPath,
  sampleHtmlReportPath,
  sampleSarifReportPath,
  "high"
], {
  cwd: root,
  encoding: "utf8"
});

if (policyComment.status !== 0 || !policyComment.stdout.includes("Policy: **examples/mcp-guard-policy.json**")) {
  process.stderr.write("policy PR comment generation failed or missed policy context.\n");
  process.stderr.write(policyComment.stderr);
  process.exit(policyComment.status ?? 1);
}

const marketplaceRoot = path.join(root, "dist", "mcp-guard-action");
const forbiddenMarketplacePaths = [".github", ".github/workflows"].filter((item) => fs.existsSync(path.join(marketplaceRoot, item)));

if (forbiddenMarketplacePaths.length > 0) {
  process.stderr.write(`Marketplace action package contains forbidden paths: ${forbiddenMarketplacePaths.join(", ")}\n`);
  process.exit(1);
}

const actionMetadata = fs.readFileSync(path.join(root, "action.yml"), "utf8");
const actionRequired = [
  "policy:",
  "MCP_GUARD_POLICY",
  "--policy",
  "audit",
  "executive-summary",
  "remediation-report",
  "audit-manifest",
  "package-manager-cache: false"
];
const actionMissing = actionRequired.filter((item) => !actionMetadata.includes(item));

if (actionMissing.length > 0) {
  process.stderr.write(`action.yml is missing expected policy/runtime content: ${actionMissing.join(", ")}\n`);
  process.exit(1);
}

const publishWorkflowPath = path.join(root, ".github", "workflows", "publish-npm.yml");
const publishWorkflow = fs.readFileSync(publishWorkflowPath, "utf8");
const publishWorkflowRequired = [
  "id-token: write",
  "actions/checkout@v6",
  "actions/setup-node@v6",
  "node-version: \"24\"",
  "package-manager-cache: false",
  "npm publish --access public"
];
const publishWorkflowMissing = publishWorkflowRequired.filter((item) => !publishWorkflow.includes(item));

if (publishWorkflowMissing.length > 0) {
  process.stderr.write(`publish-npm workflow is missing expected trusted publishing content: ${publishWorkflowMissing.join(", ")}\n`);
  process.exit(1);
}

if (publishWorkflow.includes("NODE_AUTH_TOKEN") || publishWorkflow.includes("NPM_TOKEN")) {
  process.stderr.write("publish-npm workflow must not depend on long-lived npm tokens.\n");
  process.exit(1);
}

process.stdout.write("\nrelease-check passed\n");
