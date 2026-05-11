# mcp-guard Remediation Plan

Generated: 2026-05-11T06:04:43.875Z

## Priority

- Remove shell wrappers, inline scripts, and dangerous startup commands first.
- Rotate exposed credentials and replace long-lived secrets with scoped, short-lived credentials.
- Pin and review remote MCP packages before allowing them in CI.
- Constrain working directories and filesystem arguments to dedicated project workspaces.
- Remove high-risk container runtime settings such as privileged mode, Docker socket mounts, host networking, and broad host bind mounts.
- Review remote MCP endpoints and keep an explicit allowlist for approved providers.

## Findings By Server

### shell-installer

| Severity | Rule | Evidence | Recommended fix |
| --- | --- | --- | --- |
| critical | MCP010 | command=bash args=-c curl https://example.com/install.sh \| bash | Use a direct, pinned executable instead of a shell wrapper. If a shell is required, place the script in source control and review it. |
| critical | MCP050 | curl pipe to shell | Remove the dangerous operation from MCP startup. Run destructive setup steps manually and review them separately. |

### docker-host-control

| Severity | Rule | Evidence | Recommended fix |
| --- | --- | --- | --- |
| critical | MCP080 | --privileged | Remove privileged mode and grant only the specific capabilities, devices, and filesystem paths the MCP server needs. |
| critical | MCP081 | -v /var/run/docker.sock:/var/run/docker.sock | Do not mount the Docker socket into an MCP server. Use a narrowly scoped broker or dedicated API with least-privilege authorization. |
| high | MCP082 | --network=host | Use a dedicated bridge network and expose only the ports required by the MCP server. |
| high | MCP083 | --mount=type=bind,source=/,target=/host,readonly | Mount a narrow project directory as read-only where possible, instead of root, home, or broad user folders. |

### filesystem-all-home

| Severity | Rule | Evidence | Recommended fix |
| --- | --- | --- | --- |
| high | MCP021 | package=@modelcontextprotocol/server-filesystem | Pin the package to an exact version such as package@1.2.3 and review updates before changing it. |
| high | MCP030 | GITHUB_TOKEN=ghp...890 (32 chars) | Pass the least privileged token possible. Prefer scoped tokens, short-lived credentials, and a dedicated service account. |
| high | MCP040 | cwd=/ | Run the server in a narrow project directory or sandbox with only the files it needs. |
| high | MCP041 | arg=/ | Replace broad filesystem paths with a dedicated project folder or read-only sandbox path. |
| medium | MCP020 | command=npx package=@modelcontextprotocol/server-filesystem | Pin the package version, review the package source, and prefer a local lockfile or vendored executable for sensitive tools. |

### remote-prod

| Severity | Rule | Evidence | Recommended fix |
| --- | --- | --- | --- |
| high | MCP061 | Authorization=Bea...ken (27 chars) | Use scoped, short-lived credentials and avoid placing long-lived secrets directly in MCP config files. |
| medium | MCP060 | url=https://mcp.example.com/sse | Verify the provider, use HTTPS, document the data sent to this server, and keep an allowlist of approved remote endpoints. |

## Handoff Checklist

- Remove or replace critical shell and dangerous command findings before merging.
- Pin remote MCP packages to exact versions and review package provenance.
- Reduce filesystem scope to project-specific directories.
- Move long-lived credentials out of MCP config files and rotate any exposed tokens.
- Commit a reviewed `.mcp-guard-policy.json` for approved commands, packages, directories, and remote URLs.

