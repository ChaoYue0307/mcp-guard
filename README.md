# mcp-guard

Open-source CLI scanner for risky MCP server and AI agent tool configuration.

`mcp-guard` helps developers review MCP configs before giving AI agents access to files, shells, credentials, SaaS tools, or production systems.

## What It Detects

- Shell wrappers and inline scripts.
- `node -e`, `python -c`, and other interpreter eval modes.
- Remote package runners such as `npx`, `uvx`, `bunx`, and `pnpm dlx`.
- Unpinned MCP server package versions.
- Secret-like environment variables and headers.
- Broad filesystem access such as `/`, home, Desktop, Documents, or Downloads.
- Remote MCP server URLs.
- Dangerous command patterns such as `rm -rf`, `sudo`, `chmod 777`, and curl pipe to shell.

## Install

For local development from this repo:

```bash
npm install -g .
```

After npm publication:

```bash
npm install -g agent-mcp-guard
```

## Usage

Scan common Claude Desktop, Cursor, and project MCP config locations:

```bash
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

Use in CI and fail when high-risk findings are present:

```bash
mcp-guard scan --config .mcp.json --fail-on high
```

## Supported Config Shape

`mcp-guard` supports the common MCP config shape used by Claude Desktop, Cursor, and many project configs:

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

It also accepts `servers` as an alternative top-level key.

## Example

```bash
npm run scan:example
```

This scans `examples/unsafe-claude_desktop_config.json` and writes `examples/sample-report.md`.

## Exit Codes

- `0`: scan completed and did not hit the fail threshold.
- `1`: CLI usage or runtime error.
- `2`: finding severity met `--fail-on` threshold.

## Privacy

`mcp-guard` is local-first:

- It does not upload configs.
- It does not call external APIs.
- It redacts secret-like values in reports by default.

MCP configs and reports can still contain sensitive paths, hostnames, and configuration details. Review before sharing.

## Documentation

- [Rule reference](docs/rules.md)
- [Privacy and security](docs/privacy-and-security.md)
- [Paid audit service](docs/paid-audit.md)
- [Launch checklist](docs/launch-checklist.md)
- [Operator runbook](docs/operator-runbook.md)

## Commercial Support

Need a private AI Agent/MCP security audit?

The first paid service is a focused review of your MCP and agent tool setup: inventory, risk report, remediation checklist, and a hardening call. See [docs/paid-audit.md](docs/paid-audit.md).

## License

Apache-2.0
