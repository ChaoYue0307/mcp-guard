mcp-guard scan report
Generated: 2026-05-10T14:16:12.638Z
Scanned files: 1
MCP servers: 3
Active findings: 9
Risk score: 98
Critical: 2  High: 5  Medium: 2  Low: 0

Scanned config files:
- examples/unsafe-claude_desktop_config.json

Active findings:
- [CRITICAL] MCP010 Shell command executes inline script
  Server: shell-installer
  Evidence: command=bash args=-c curl https://example.com/install.sh | bash
  Fingerprint: mcpg_a009b2c2
  Fix: Use a direct, pinned executable instead of a shell wrapper. If a shell is required, place the script in source control and review it.
- [CRITICAL] MCP050 MCP server command includes a dangerous operation
  Server: shell-installer
  Evidence: curl pipe to shell
  Fingerprint: mcpg_6bd13204
  Fix: Remove the dangerous operation from MCP startup. Run destructive setup steps manually and review them separately.
- [HIGH] MCP021 Remote MCP package is not version pinned
  Server: filesystem-all-home
  Evidence: package=@modelcontextprotocol/server-filesystem
  Fingerprint: mcpg_d0af49fa
  Fix: Pin the package to an exact version such as package@1.2.3 and review updates before changing it.
- [HIGH] MCP030 Secret-like environment variable is exposed to MCP server
  Server: filesystem-all-home
  Evidence: GITHUB_TOKEN=ghp...890 (32 chars)
  Fingerprint: mcpg_a5f382b0
  Fix: Pass the least privileged token possible. Prefer scoped tokens, short-lived credentials, and a dedicated service account.
- [HIGH] MCP040 MCP server has a broad working directory
  Server: filesystem-all-home
  Evidence: cwd=/
  Fingerprint: mcpg_31aaa689
  Fix: Run the server in a narrow project directory or sandbox with only the files it needs.
- [HIGH] MCP041 MCP server argument grants broad filesystem access
  Server: filesystem-all-home
  Evidence: arg=/
  Fingerprint: mcpg_dbc08d76
  Fix: Replace broad filesystem paths with a dedicated project folder or read-only sandbox path.
- [HIGH] MCP061 Secret-like header is configured for remote MCP server
  Server: remote-prod
  Evidence: Authorization=Bea...ken (27 chars)
  Fingerprint: mcpg_5abd4cbd
  Fix: Use scoped, short-lived credentials and avoid placing long-lived secrets directly in MCP config files.
- [MEDIUM] MCP020 MCP server is launched through a remote package runner
  Server: filesystem-all-home
  Evidence: command=npx package=@modelcontextprotocol/server-filesystem
  Fingerprint: mcpg_a3493a53
  Fix: Pin the package version, review the package source, and prefer a local lockfile or vendored executable for sensitive tools.
- [MEDIUM] MCP060 Remote MCP server URL is configured
  Server: remote-prod
  Evidence: url=https://mcp.example.com/sse
  Fingerprint: mcpg_cf1296e4
  Fix: Verify the provider, use HTTPS, document the data sent to this server, and keep an allowlist of approved remote endpoints.
