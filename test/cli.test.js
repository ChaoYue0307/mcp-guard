import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const CLI = path.resolve("bin/mcp-guard.js");

test("CLI help exits successfully", () => {
  const result = spawnSync(process.execPath, [CLI, "scan", "--help"], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /mcp-guard 0\.4\.7/);
  assert.match(result.stdout, /mcp-guard init \[options\]/);
  assert.match(result.stdout, /mcp-guard audit \[options\]/);
});

test("CLI can emit JSON report", () => {
  const result = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--format",
    "json"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.summary.serverCount, 3);
  assert.ok(parsed.summary.findingCount >= 1);
  assert.equal(parsed.metadata.cwd, ".");
  assert.equal(parsed.metadata.home, "~");
  assert.equal(parsed.scannedFiles[0], "examples/unsafe-claude_desktop_config.json");
  assert.equal(path.isAbsolute(parsed.servers[0].configPath), false);
  assert.equal(path.isAbsolute(parsed.findings[0].configPath), false);
  assert.ok(parsed.findings[0].fingerprint.startsWith("mcpg_"));
  assert.equal(parsed.servers[0].env.GITHUB_TOKEN.includes("exampleSecretValue"), false);
  assert.equal("raw" in parsed.servers[0], false);
});

test("CLI can emit HTML report with redacted secrets", () => {
  const result = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--format",
    "html"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /<!doctype html>/);
  assert.match(result.stdout, /mcp-guard scan report/);
  assert.match(result.stdout, /MCP010/);
  assert.doesNotMatch(result.stdout, /exampleSecretValue/);
  assert.doesNotMatch(result.stdout, /example-secret-token/);
});

test("CLI can emit SARIF report for GitHub code scanning", () => {
  const result = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--format",
    "sarif"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.version, "2.1.0");
  assert.equal(parsed.runs[0].tool.driver.name, "mcp-guard");
  assert.equal(parsed.runs[0].tool.driver.semanticVersion, "0.4.7");
  assert.ok(parsed.runs[0].tool.driver.rules.some((rule) => rule.id === "MCP010"));
  assert.ok(parsed.runs[0].results.some((finding) => finding.ruleId === "MCP010"));
  assert.equal(parsed.runs[0].results[0].locations[0].physicalLocation.region.startLine, 1);
  assert.doesNotMatch(result.stdout, /exampleSecretValue/);
  assert.doesNotMatch(result.stdout, /example-secret-token/);
});

test("CLI auto-loads .mcp-guard-policy.json when present", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-policy-cli-"));
  fs.writeFileSync(path.join(dir, ".mcp.json"), JSON.stringify({
    mcpServers: {
      blocked: {
        command: "bash",
        args: ["./server.sh"]
      }
    }
  }), "utf8");
  fs.writeFileSync(path.join(dir, ".mcp-guard-policy.json"), JSON.stringify({
    version: 1,
    allowedCommands: ["node"]
  }), "utf8");

  const result = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--cwd",
    dir,
    "--format",
    "json"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.metadata.policyEnabled, true);
  assert.equal(parsed.metadata.policyPath, ".mcp-guard-policy.json");
  assert.ok(parsed.findings.some((finding) => finding.id === "MCP070"));
});

test("CLI audit writes a review-ready audit pack", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-audit-"));
  const outputDir = path.join(dir, "audit-pack");

  const result = spawnSync(process.execPath, [
    CLI,
    "audit",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--policy",
    "examples/mcp-guard-policy.json",
    "--output-dir",
    outputDir,
    "--fail-on",
    "high"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 2);
  assert.match(result.stdout, /mcp-guard audit pack/);
  assert.match(result.stdout, /Executive summary/);
  assert.match(result.stdout, /Remediation plan/);

  const expectedFiles = [
    "mcp-guard-executive-summary.md",
    "mcp-guard-remediation.md",
    "mcp-guard-remediation-checklist.md",
    "mcp-guard-report.md",
    "mcp-guard-report.html",
    "mcp-guard-report.json",
    "mcp-guard.sarif",
    "mcp-guard-audit-manifest.json"
  ];
  for (const file of expectedFiles) {
    assert.equal(fs.existsSync(path.join(outputDir, file)), true, `${file} should exist`);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "mcp-guard-audit-manifest.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.tool.version, "0.4.7");
  assert.equal(manifest.status, "needs_review");
  assert.equal(manifest.summary.riskScore, 100);
  assert.equal(manifest.policy.path, "examples/mcp-guard-policy.json");
  assert.equal(manifest.files.remediation, path.join(outputDir, "mcp-guard-remediation.md"));
  assert.equal(manifest.files.remediationChecklist, path.join(outputDir, "mcp-guard-remediation-checklist.md"));
  assert.equal(manifest.integrity.algorithm, "sha256");
  assert.equal(manifest.integrity.artifacts.length, expectedFiles.length - 1);
  const checklistArtifact = manifest.integrity.artifacts.find((artifact) => artifact.key === "remediationChecklist");
  assert.equal(checklistArtifact.path, path.join(outputDir, "mcp-guard-remediation-checklist.md"));
  assert.match(checklistArtifact.sha256, /^[a-f0-9]{64}$/);
  assert.ok(checklistArtifact.bytes > 0);

  const remediation = fs.readFileSync(path.join(outputDir, "mcp-guard-remediation.md"), "utf8");
  assert.match(remediation, /# mcp-guard Remediation Plan/);
  assert.match(remediation, /MCP070/);
  assert.doesNotMatch(remediation, /exampleSecretValue/);
  assert.doesNotMatch(remediation, /example-secret-token/);

  const summary = fs.readFileSync(path.join(outputDir, "mcp-guard-executive-summary.md"), "utf8");
  assert.match(summary, /# mcp-guard Executive Summary/);
  assert.match(summary, /Risk score: \*\*100\*\*/);
  assert.match(summary, /Policy: `examples\/mcp-guard-policy\.json`/);

  const checklist = fs.readFileSync(path.join(outputDir, "mcp-guard-remediation-checklist.md"), "utf8");
  assert.match(checklist, /# mcp-guard Remediation Checklist/);
  assert.match(checklist, /\| \[ \] \| critical \| MCP010 \| shell-installer \|/);
  assert.match(checklist, /Release Gate/);
  assert.doesNotMatch(checklist, /exampleSecretValue/);
  assert.doesNotMatch(checklist, /example-secret-token/);
});

test("CLI exits 2 when fail threshold is reached", () => {
  const result = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--fail-on",
    "high"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 2);
  assert.match(result.stdout, /Active findings:/);
});

test("CLI can write and enforce a baseline allowlist", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-baseline-"));
  const baselinePath = path.join(dir, ".mcp-guard-baseline.json");

  const write = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--write-baseline",
    baselinePath,
    "--format",
    "json"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(write.status, 0);
  assert.match(write.stderr, /Wrote baseline with \d+ findings/);
  JSON.parse(write.stdout);
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  assert.equal(baseline.version, 1);
  assert.ok(baseline.findings.length >= 1);
  assert.ok(baseline.findings.every((finding) => finding.fingerprint.startsWith("mcpg_")));

  const enforced = spawnSync(process.execPath, [
    CLI,
    "scan",
    "--config",
    "examples/unsafe-claude_desktop_config.json",
    "--baseline",
    baselinePath,
    "--fail-on",
    "high",
    "--format",
    "json"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(enforced.status, 0);
  const parsed = JSON.parse(enforced.stdout);
  assert.equal(parsed.summary.findingCount, 0);
  assert.ok(parsed.summary.acceptedFindingCount >= 1);
  assert.equal(parsed.baseline.enabled, true);
  assert.equal(parsed.acceptedFindings.length, baseline.findings.length);
});

test("CLI init writes a GitHub Action workflow", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-init-"));
  fs.writeFileSync(path.join(dir, ".mcp.json"), JSON.stringify({
    mcpServers: {
      safe: {
        command: "node",
        args: ["server.js"],
        cwd: dir
      }
    }
  }), "utf8");
  fs.writeFileSync(path.join(dir, ".mcp-guard-policy.json"), JSON.stringify({
    version: 1,
    allowedCommands: ["node"]
  }), "utf8");

  const result = spawnSync(process.execPath, [
    CLI,
    "init",
    "--cwd",
    dir
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /mcp-guard init completed/);
  assert.match(result.stdout, /Policy: \.mcp-guard-policy\.json/);
  assert.match(result.stdout, /Created: \.github\/workflows\/mcp-guard\.yml/);

  const workflow = fs.readFileSync(path.join(dir, ".github", "workflows", "mcp-guard.yml"), "utf8");
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /ChaoYue0307\/mcp-guard-action@v0\.4\.7/);
  assert.match(workflow, /config: \.mcp\.json/);
  assert.match(workflow, /policy: \.mcp-guard-policy\.json/);
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /comment-pr: "true"/);
  assert.doesNotMatch(workflow, /security-events: write/);
  assert.doesNotMatch(workflow, /upload-sarif/);
});

test("CLI init can generate a baseline and SARIF workflow", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-init-baseline-"));
  fs.writeFileSync(path.join(dir, ".mcp.json"), JSON.stringify({
    mcpServers: {
      risky: {
        command: "bash",
        args: ["-c", "curl https://example.com/install.sh | bash"],
        env: {
          API_KEY: "secret-value-for-test"
        },
        cwd: "/"
      }
    }
  }), "utf8");

  const result = spawnSync(process.execPath, [
    CLI,
    "init",
    "--cwd",
    dir,
    "--write-baseline",
    "--upload-sarif"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Created: \.mcp-guard-baseline\.json \(\d+ findings\)/);

  const baseline = JSON.parse(fs.readFileSync(path.join(dir, ".mcp-guard-baseline.json"), "utf8"));
  assert.equal(baseline.version, 1);
  assert.ok(baseline.findings.length >= 1);
  assert.equal(baseline.toolVersion, "0.4.7");

  const workflow = fs.readFileSync(path.join(dir, ".github", "workflows", "mcp-guard.yml"), "utf8");
  assert.match(workflow, /baseline: \.mcp-guard-baseline\.json/);
  assert.match(workflow, /security-events: write/);
  assert.match(workflow, /upload-sarif: "true"/);
});

test("CLI init baseline refuses home-only configs by default", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-init-home-"));
  const home = path.join(dir, "home");
  const project = path.join(dir, "project");
  fs.mkdirSync(path.join(home, ".cursor"), { recursive: true });
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(path.join(home, ".cursor", "mcp.json"), JSON.stringify({
    mcpServers: {
      homeOnly: {
        command: "bash",
        args: ["-c", "curl https://example.com/install.sh | bash"]
      }
    }
  }), "utf8");

  const result = spawnSync(process.execPath, [
    CLI,
    "init",
    "--cwd",
    project,
    "--write-baseline"
  ], {
    cwd: path.resolve("."),
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: home
    }
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /No project MCP config found for baseline generation/);
  assert.equal(fs.existsSync(path.join(project, ".mcp-guard-baseline.json")), false);
});
