<p align="center">
  <img src="site/assets/readme-hero.svg" alt="mcp-guard scan report hero" width="100%">
</p>

# mcp-guard

Local-first security scanning for MCP and AI agent tool configs.

`mcp-guard` helps teams review what their AI agents can execute before those agents touch local files, shells, credentials, SaaS accounts, or production systems.

Website: [chaoyue0307.github.io/mcp-guard](https://chaoyue0307.github.io/mcp-guard/)

Marketplace: [mcp-guard MCP Security Scanner](https://github.com/marketplace/actions/mcp-guard-mcp-security-scanner)

Live demo PR: [mcp-guard-demo#1](https://github.com/ChaoYue0307/mcp-guard-demo/pull/1)

<p>
  <a href="https://www.npmjs.com/package/agent-mcp-guard"><img alt="npm version" src="https://img.shields.io/npm/v/agent-mcp-guard?color=0f766e"></a>
  <a href="https://github.com/marketplace/actions/mcp-guard-mcp-security-scanner"><img alt="GitHub Marketplace" src="https://img.shields.io/badge/Marketplace-mcp--guard-0f766e?logo=github"></a>
  <a href="https://github.com/ChaoYue0307/mcp-guard/actions"><img alt="CI" src="https://github.com/ChaoYue0307/mcp-guard/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0-111827"></a>
  <a href="https://github.com/ChaoYue0307/mcp-guard/releases/tag/v0.4.6"><img alt="Release" src="https://img.shields.io/github/v/release/ChaoYue0307/mcp-guard?color=7c2d12"></a>
</p>

## Install

```bash
npm install -g agent-mcp-guard
mcp-guard scan
```

Bootstrap a repository with a GitHub Action:

```bash
mcp-guard init
```

Bootstrap CI and accept current reviewed findings as a baseline:

```bash
mcp-guard init --write-baseline --upload-sarif
```

Scan a specific config:

```bash
mcp-guard scan --config .mcp.json
```

Generate a Markdown report:

```bash
mcp-guard scan --format markdown --output mcp-guard-report.md
```

Generate an HTML report:

```bash
mcp-guard scan --format html --output mcp-guard-report.html
```

Generate SARIF for GitHub code scanning:

```bash
mcp-guard scan --format sarif --output mcp-guard.sarif
```

Generate a review-ready audit pack:

```bash
mcp-guard audit --config .mcp.json --policy .mcp-guard-policy.json --output-dir mcp-guard-audit
```

Use in CI:

```bash
mcp-guard scan --config .mcp.json --fail-on high
```

Enforce a team policy for approved commands, packages, directories, and remote URLs:

```bash
mcp-guard scan --config .mcp.json --policy .mcp-guard-policy.json --fail-on high
```

Accept known findings and fail only on new risk:

```bash
mcp-guard scan --config .mcp.json --write-baseline .mcp-guard-baseline.json
mcp-guard scan --config .mcp.json --baseline .mcp-guard-baseline.json --fail-on high
```

Use the GitHub Action:

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.4.6
  with:
    config: .mcp.json
    # policy: .mcp-guard-policy.json
    baseline: .mcp-guard-baseline.json
    fail-on: high
    comment-pr: "true"
    upload-sarif: "true"
```

Inspect the live demo pull request: [ChaoYue0307/mcp-guard-demo#1](https://github.com/ChaoYue0307/mcp-guard-demo/pull/1). It intentionally introduces risky MCP config so the Action fails, uploads reports, and sends SARIF to GitHub code scanning.

## End-to-End Example

Use the transparent example to evaluate what the scanner actually does:

- input config: [site/e2e/claude_desktop_config.json](site/e2e/claude_desktop_config.json)
- generated Markdown report: [site/e2e/report.md](site/e2e/report.md)
- generated HTML report: [site/e2e/report.html](site/e2e/report.html)
- generated JSON report: [site/e2e/report.json](site/e2e/report.json)
- generated SARIF report: [site/e2e/report.sarif](site/e2e/report.sarif)
- generated audit summary: [site/e2e/audit/mcp-guard-executive-summary.md](site/e2e/audit/mcp-guard-executive-summary.md)
- generated remediation plan: [site/e2e/audit/mcp-guard-remediation.md](site/e2e/audit/mcp-guard-remediation.md)
- generated remediation checklist: [site/e2e/audit/mcp-guard-remediation-checklist.md](site/e2e/audit/mcp-guard-remediation-checklist.md)

The example scans 3 MCP servers and reports 9 active findings with a risk score of 98. It is synthetic, but fully reproducible from committed files.

For the GitHub Action workflow, inspect the public demo repository: [ChaoYue0307/mcp-guard-demo](https://github.com/ChaoYue0307/mcp-guard-demo).

## What It Finds

| Risk | Why it matters |
| --- | --- |
| Shell wrappers and inline scripts | Agent startup can become arbitrary code execution. |
| `npx`, `uvx`, `bunx`, `pnpm dlx` | Remote package execution expands supply-chain risk. |
| Unpinned packages | A trusted MCP server can change underneath you. |
| Secret-like env vars and headers | Long-lived tokens leak into tool runtimes and reports. |
| Broad filesystem access | Home, root, Desktop, Documents, and Downloads are high-blast-radius paths. |
| Remote MCP URLs | Data may leave the local trust boundary. |
| Dangerous command patterns | `rm -rf`, `sudo`, `chmod 777`, and curl-pipe-shell should block review. |
| Policy violations | Teams can enforce approved commands, packages, directories, and remote URLs. |

## Team Workflow

`mcp-guard` now supports a baseline/allowlist workflow for real teams:

1. Generate a baseline from already-known findings.
2. Commit the baseline file after review.
3. Run CI with `--baseline` so accepted findings are visible but do not fail the build.
4. Fail pull requests only when new high-risk MCP changes appear.

The GitHub Action can also post an optional pull request comment with the active finding summary.

For paid setup or internal review handoff, `mcp-guard audit` writes a complete evidence package with:

- executive summary;
- remediation plan grouped by MCP server;
- remediation checklist for PR or handoff tracking;
- Markdown, HTML, JSON, and SARIF reports;
- machine-readable audit manifest.

For stricter governance, commit `.mcp-guard-policy.json` and define the commands, remote packages, filesystem roots, and remote MCP endpoints the team has approved. See [Policy files](docs/policy.md).

For a guided setup, run:

```bash
mcp-guard init --write-baseline --upload-sarif
```

This writes `.github/workflows/mcp-guard.yml` and `.mcp-guard-baseline.json`, using `actions/checkout@v6`, the current Marketplace Action tag, PR comments, and optional SARIF upload.

## Example Output

```text
mcp-guard scan report
Scanned files: 1
MCP servers: 3
Active findings: 9
Risk score: 98
Critical: 2  High: 5  Medium: 2  Low: 0

- [CRITICAL] MCP010 Shell command executes inline script
- [HIGH] MCP021 Remote MCP package is not version pinned
- [HIGH] MCP030 Secret-like environment variable is exposed to MCP server
- [HIGH] MCP041 MCP server argument grants broad filesystem access
```

See the full sample report: [examples/sample-report.md](examples/sample-report.md)

## Supported Config Shape

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/project"],
      "env": {
        "API_KEY": "..."
      },
      "cwd": "/path/to/project"
    }
  }
}
```

`mcp-guard` supports the common `mcpServers` shape used by Claude Desktop, Cursor, and project-level MCP configs. It also accepts `servers` as an alternative top-level key.

## Why Local-First

MCP configs often contain sensitive local paths, internal hostnames, tokens, and workflow details. `mcp-guard` runs locally by default:

- no config upload;
- no external API call;
- secret-like values redacted in reports;
- text, Markdown, HTML, JSON, and SARIF output for local review, CI artifacts, and GitHub code scanning.

## Setup Pilot

Want to try `mcp-guard` on a real AI agent or MCP setup?

The project is an automated local scanner. Paid setup help is available for teams that want the CLI, GitHub Action, baseline workflow, PR comments, and SARIF reporting wired into a real repository.

Typical scope:

- install and run the CLI against redacted local MCP configs;
- create the GitHub Action workflow;
- define an initial `.mcp-guard-policy.json`;
- generate and review an initial baseline;
- enable PR comments and optional GitHub code scanning;
- record missing rules or config shapes as product feedback.

Contact: [hechaoyue0307@gmail.com](mailto:hechaoyue0307@gmail.com)

## Documentation

- [Rule reference](docs/rules.md)
- [Audit packs](docs/audit.md)
- [Baseline and allowlist](docs/baseline.md)
- [Policy files](docs/policy.md)
- [GitHub Action](docs/github-action.md)
- [Marketplace publishing plan](docs/marketplace.md)
- [Privacy and security](docs/privacy-and-security.md)
- [Trusted publishing](docs/trusted-publishing.md)
- [Roadmap](docs/roadmap.md)
- [Operator runbook](docs/operator-runbook.md)

## Exit Codes

- `0`: scan completed and did not hit the fail threshold.
- `1`: CLI usage or runtime error.
- `2`: finding severity met `--fail-on` threshold.

## Development

```bash
npm test
npm run release:check
```

## License

Apache-2.0
