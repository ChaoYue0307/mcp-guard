# mcp-guard Executive Summary

Generated: 2026-05-10T20:08:00.622Z
Status: **Needs review**
Risk score: **98**
Fail threshold: **none**

## Scope

- Scanned files: 1
- MCP servers: 3
- Active findings: 9
- Critical: 2
- High: 5
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
| high | MCP021 | filesystem-all-home | Remote MCP package is not version pinned |
| high | MCP030 | filesystem-all-home | Secret-like environment variable is exposed to MCP server |
| high | MCP040 | filesystem-all-home | MCP server has a broad working directory |
| high | MCP041 | filesystem-all-home | MCP server argument grants broad filesystem access |
| high | MCP061 | remote-prod | Secret-like header is configured for remote MCP server |
| medium | MCP020 | filesystem-all-home | MCP server is launched through a remote package runner |

## Review Notes

- Secret-like values are redacted before reports are written.
- Review MCP servers before granting access to local files, shell commands, SaaS accounts, or production systems.
- This audit pack is generated locally and does not upload MCP configuration to a hosted service.

