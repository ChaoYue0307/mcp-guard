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
  assert.match(result.stdout, /mcp-guard 0\.4\.1/);
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
  assert.equal(parsed.runs[0].tool.driver.semanticVersion, "0.4.1");
  assert.ok(parsed.runs[0].tool.driver.rules.some((rule) => rule.id === "MCP010"));
  assert.ok(parsed.runs[0].results.some((finding) => finding.ruleId === "MCP010"));
  assert.equal(parsed.runs[0].results[0].locations[0].physicalLocation.region.startLine, 1);
  assert.doesNotMatch(result.stdout, /exampleSecretValue/);
  assert.doesNotMatch(result.stdout, /example-secret-token/);
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
