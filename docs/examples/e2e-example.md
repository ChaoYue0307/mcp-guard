# End-to-End Example

This example is designed for transparent product evaluation. It uses a synthetic MCP config committed to the repository, then runs the real `mcp-guard` CLI to generate Markdown, HTML, JSON, SARIF, and audit pack outputs.

The input is intentionally unsafe so users can see whether the scanner catches concrete risks.

## Input

Config file:

- [`site/e2e/claude_desktop_config.json`](../../site/e2e/claude_desktop_config.json)

It contains four MCP server entries:

- `filesystem-all-home`: launches an unpinned remote package with broad filesystem access and a secret-like environment variable.
- `shell-installer`: runs `bash -c` with a curl-pipe-shell installer pattern.
- `docker-host-control`: starts a container with privileged mode, host networking, Docker socket access, and root bind mount access.
- `remote-prod`: points at a remote MCP endpoint with a secret-like authorization header.

## Reproduce the Reports

```bash
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format markdown --output site/e2e/report.md
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format html --output site/e2e/report.html
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format json --output site/e2e/report.json
node ./bin/mcp-guard.js scan --config site/e2e/claude_desktop_config.json --format sarif --output site/e2e/report.sarif
node ./bin/mcp-guard.js audit --config site/e2e/claude_desktop_config.json --output-dir site/e2e/audit
node ./bin/mcp-guard.js verify-audit --manifest site/e2e/audit/mcp-guard-audit-manifest.json
```

## Expected Result

The current scanner reports:

- Risk score: `100`
- Findings: `13`
- Critical: `4`
- High: `7`
- Medium: `2`
- Low: `0`

Important findings include:

- `MCP010`: shell command executes inline script.
- `MCP050`: curl-pipe-shell startup command.
- `MCP080`: privileged container runtime.
- `MCP081`: Docker socket mounted into the MCP server.
- `MCP082`: host networking enabled for the MCP server container.
- `MCP083`: broad host filesystem bind mount.
- `MCP021`: unpinned remote MCP package.
- `MCP030`: secret-like environment variable.
- `MCP040` and `MCP041`: broad working directory and filesystem argument.
- `MCP061`: secret-like remote header.

## Generated Artifacts

- [Markdown report](../../site/e2e/report.md)
- [HTML report](../../site/e2e/report.html)
- [JSON report](../../site/e2e/report.json)
- [SARIF report](../../site/e2e/report.sarif)
- [Audit executive summary](../../site/e2e/audit/mcp-guard-executive-summary.md)
- [Audit remediation plan](../../site/e2e/audit/mcp-guard-remediation.md)
- [Audit remediation checklist](../../site/e2e/audit/mcp-guard-remediation-checklist.md)
- [Audit manifest](../../site/e2e/audit/mcp-guard-audit-manifest.json)

## What This Proves

- The scanner does not need the config to leave the machine.
- Secret-like values are redacted in reports.
- Findings include rule IDs, severity, evidence, and remediation guidance.
- The same scan can feed a human-readable HTML report, automation JSON, GitHub code scanning SARIF, and a review-ready audit handoff package with a remediation checklist.
- The audit handoff can be verified later because the manifest records SHA-256 hashes and byte sizes for each generated report.
