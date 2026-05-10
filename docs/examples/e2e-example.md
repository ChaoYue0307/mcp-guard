# End-to-End Example

This example is designed for transparent product evaluation. It uses a synthetic MCP config committed to the repository, then runs the real `mcp-guard` CLI to generate Markdown, HTML, JSON, and SARIF outputs.

The input is intentionally unsafe so users can see whether the scanner catches concrete risks.

## Input

Config file:

- [`site/e2e/claude_desktop_config.json`](../../site/e2e/claude_desktop_config.json)

It contains three MCP server entries:

- `filesystem-all-home`: launches an unpinned remote package with broad filesystem access and a secret-like environment variable.
- `shell-installer`: runs `bash -c` with a curl-pipe-shell installer pattern.
- `remote-prod`: points at a remote MCP endpoint with a secret-like authorization header.

## Reproduce the Reports

```bash
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format markdown --output site/e2e/report.md
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format html --output site/e2e/report.html
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format json --output site/e2e/report.json
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format sarif --output site/e2e/report.sarif
```

## Expected Result

The current scanner reports:

- Risk score: `98`
- Findings: `9`
- Critical: `2`
- High: `5`
- Medium: `2`
- Low: `0`

Important findings include:

- `MCP010`: shell command executes inline script.
- `MCP050`: curl-pipe-shell startup command.
- `MCP021`: unpinned remote MCP package.
- `MCP030`: secret-like environment variable.
- `MCP040` and `MCP041`: broad working directory and filesystem argument.
- `MCP061`: secret-like remote header.

## Generated Artifacts

- [Markdown report](../../site/e2e/report.md)
- [HTML report](../../site/e2e/report.html)
- [JSON report](../../site/e2e/report.json)
- [SARIF report](../../site/e2e/report.sarif)

## What This Proves

- The scanner does not need the config to leave the machine.
- Secret-like values are redacted in reports.
- Findings include rule IDs, severity, evidence, and remediation guidance.
- The same scan can feed a human-readable HTML report, automation JSON, and GitHub code scanning SARIF.
