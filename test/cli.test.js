import assert from "node:assert/strict";
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
  assert.match(result.stdout, /mcp-guard 0\.1\.1/);
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
  assert.equal(parsed.servers[0].env.GITHUB_TOKEN.includes("exampleSecretValue"), false);
  assert.equal("raw" in parsed.servers[0], false);
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
  assert.match(result.stdout, /Findings:/);
});
