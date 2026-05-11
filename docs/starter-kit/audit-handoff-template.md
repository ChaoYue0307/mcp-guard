# Audit Handoff Template

Use this template after generating a local `mcp-guard audit` pack.

## Summary

- Repository:
- Review date:
- Reviewer:
- Risk score:
- Active findings:
- Accepted baseline findings:
- Policy file:
- Baseline file:

## Commands Run

```sh
mcp-guard audit --config .mcp.json \
  --policy .mcp-guard-policy.json \
  --baseline .mcp-guard-baseline.json \
  --output-dir mcp-guard-audit

mcp-guard verify-audit --manifest mcp-guard-audit/mcp-guard-audit-manifest.json
```

## Artifacts

| Artifact | Path | Verified |
| --- | --- | --- |
| Executive summary | `mcp-guard-audit/mcp-guard-executive-summary.md` |  |
| Remediation plan | `mcp-guard-audit/mcp-guard-remediation.md` |  |
| Remediation checklist | `mcp-guard-audit/mcp-guard-remediation-checklist.md` |  |
| Markdown report | `mcp-guard-audit/mcp-guard-report.md` |  |
| HTML report | `mcp-guard-audit/mcp-guard-report.html` |  |
| JSON report | `mcp-guard-audit/mcp-guard-report.json` |  |
| SARIF report | `mcp-guard-audit/mcp-guard.sarif` |  |
| Manifest | `mcp-guard-audit/mcp-guard-audit-manifest.json` |  |

## First Remediation Steps

1. Remove or replace any shell wrapper command flagged by `MCP010` or `MCP050`.
2. Pin remote package runners flagged by `MCP021`.
3. Narrow broad filesystem paths flagged by `MCP040` or `MCP041`.
4. Move long-lived credentials out of MCP config files.
5. Remove privileged container flags, Docker socket mounts, host networking, and broad host mounts.

## Safe Sharing

- Share redacted reports only.
- Do not attach raw private MCP config files to public issues.
- Use the manifest to verify report integrity before handoff.
