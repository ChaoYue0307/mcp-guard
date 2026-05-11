# mcp-guard Executive Summary

Generated: 2026-05-11T04:45:49.380Z
Status: **Needs review**
Risk score: **100**
Fail threshold: **none**

## Scope

- Scanned files: 1
- MCP servers: 4
- Active findings: 13
- Critical: 4
- High: 7
- Medium: 2
- Low: 0

## Decision Guidance

- Block merge or rollout until critical findings are removed or explicitly redesigned.
- Review high findings before merge, especially shell access, secrets, remote package execution, and broad filesystem scope.
- Add `.mcp-guard-policy.json` to turn this review into an enforceable team allowlist.
- After remediation, generate a baseline only for intentionally accepted residual findings.

## Top Active Findings

| Severity | Rule | Server | Finding |
| --- | --- | --- | --- |
| critical | MCP010 | shell-installer | Shell command executes inline script |
| critical | MCP050 | shell-installer | MCP server command includes a dangerous operation |
| critical | MCP080 | docker-host-control | Container MCP server runs in privileged mode |
| critical | MCP081 | docker-host-control | Container MCP server mounts the Docker socket |
| high | MCP021 | filesystem-all-home | Remote MCP package is not version pinned |
| high | MCP030 | filesystem-all-home | Secret-like environment variable is exposed to MCP server |
| high | MCP040 | filesystem-all-home | MCP server has a broad working directory |
| high | MCP041 | filesystem-all-home | MCP server argument grants broad filesystem access |

## Review Notes

- Secret-like values are redacted before reports are written.
- Review MCP servers before granting access to local files, shell commands, SaaS accounts, or production systems.
- This audit pack is generated locally and does not upload MCP configuration to a hosted service.

