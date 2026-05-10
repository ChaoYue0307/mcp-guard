# mcp-guard Remediation Checklist

Generated: 2026-05-10T20:51:28.472Z
Risk score: **98**
Active findings: **9**

## Release Gate

- [ ] Critical findings are removed or the MCP server is redesigned.
- [ ] High findings are reviewed before merge or rollout.
- [ ] Any accepted residual risk is documented in policy or baseline.

## Remediation Tasks

| Done | Priority | Rule | Server | Action | Fingerprint |
| --- | --- | --- | --- | --- | --- |
| [ ] | critical | MCP010 | shell-installer | Replace the shell wrapper for server `shell-installer` with a direct reviewed executable or checked-in script. | mcpg_c2b742f0 |
| [ ] | critical | MCP050 | shell-installer | Remove the dangerous startup operation from server `shell-installer` and run setup manually after review. | mcpg_73e1a0da |
| [ ] | high | MCP021 | filesystem-all-home | Pin and approve the remote package used by server `filesystem-all-home`. | mcpg_7390d900 |
| [ ] | high | MCP030 | filesystem-all-home | Move credentials for server `filesystem-all-home` out of MCP config and rotate any exposed tokens. | mcpg_73964a76 |
| [ ] | high | MCP040 | filesystem-all-home | Constrain filesystem access for server `filesystem-all-home` to a reviewed project directory. | mcpg_70425125 |
| [ ] | high | MCP041 | filesystem-all-home | Constrain filesystem access for server `filesystem-all-home` to a reviewed project directory. | mcpg_eea814c0 |
| [ ] | high | MCP061 | remote-prod | Move credentials for server `remote-prod` out of MCP config and rotate any exposed tokens. | mcpg_ad4db81f |
| [ ] | medium | MCP020 | filesystem-all-home | Pin and approve the remote package used by server `filesystem-all-home`. | mcpg_df881ae7 |
| [ ] | medium | MCP060 | remote-prod | Review and allowlist the remote MCP endpoint used by server `remote-prod`. | mcpg_45117870 |

## Closeout

- [ ] Re-run `mcp-guard audit` after changes.
- [ ] Commit updated `.mcp-guard-policy.json` only for reviewed approvals.
- [ ] Commit or update `.mcp-guard-baseline.json` only for intentionally accepted findings.

