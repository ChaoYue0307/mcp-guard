<p align="center">
  <img src="site/assets/readme-hero.svg" alt="mcp-guard scan report hero" width="100%">
</p>

# mcp-guard

Local-first security scanning for MCP and AI agent tool configs.

`mcp-guard` helps teams review what their AI agents can execute before those agents touch local files, shells, credentials, SaaS accounts, or production systems.

Website: [chaoyue0307.github.io/mcp-guard](https://chaoyue0307.github.io/mcp-guard/)

<p>
  <a href="https://www.npmjs.com/package/agent-mcp-guard"><img alt="npm version" src="https://img.shields.io/npm/v/agent-mcp-guard?color=0f766e"></a>
  <a href="https://github.com/ChaoYue0307/mcp-guard/actions"><img alt="CI" src="https://github.com/ChaoYue0307/mcp-guard/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0-111827"></a>
  <a href="https://github.com/ChaoYue0307/mcp-guard/releases/tag/v0.3.0"><img alt="Release" src="https://img.shields.io/github/v/release/ChaoYue0307/mcp-guard?color=7c2d12"></a>
</p>

## Install

```bash
npm install -g agent-mcp-guard
mcp-guard scan
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

Use in CI:

```bash
mcp-guard scan --config .mcp.json --fail-on high
```

Use the GitHub Action:

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.3.0
  with:
    fail-on: high
    upload-sarif: "true"
```

## End-to-End Example

Use the transparent example to evaluate what the scanner actually does:

- input config: [site/e2e/claude_desktop_config.json](site/e2e/claude_desktop_config.json)
- generated Markdown report: [site/e2e/report.md](site/e2e/report.md)
- generated HTML report: [site/e2e/report.html](site/e2e/report.html)
- generated JSON report: [site/e2e/report.json](site/e2e/report.json)
- generated SARIF report: [site/e2e/report.sarif](site/e2e/report.sarif)

The example scans 3 MCP servers and reports 9 findings with a risk score of 98. It is synthetic, but fully reproducible from committed files.

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

## Example Output

```text
mcp-guard scan report
Scanned files: 1
MCP servers: 3
Findings: 9
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

## Early Access and Feedback

Want to try `mcp-guard` on a real AI agent or MCP setup?

The project is currently an automated local scanner. I am collecting early users, real-world config examples, CI setup feedback, and rule requests to improve coverage.

Contact: [hechaoyue0307@gmail.com](mailto:hechaoyue0307@gmail.com)

## Documentation

- [Rule reference](docs/rules.md)
- [GitHub Action](docs/github-action.md)
- [Marketplace publishing plan](docs/marketplace.md)
- [Privacy and security](docs/privacy-and-security.md)
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
