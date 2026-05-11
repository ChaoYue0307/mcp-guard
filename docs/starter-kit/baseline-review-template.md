# Baseline Review Template

Use this worksheet before committing `.mcp-guard-baseline.json`.

## Repository

- Repository:
- Reviewer:
- Date:
- MCP config files reviewed:
- Command run:

```sh
mcp-guard scan --config .mcp.json --write-baseline .mcp-guard-baseline.json
mcp-guard scan --config .mcp.json --baseline .mcp-guard-baseline.json --fail-on high
```

## Accepted Findings

| Fingerprint | Rule | Severity | Server | Reason accepted | Expiration or re-review date |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Required Fixes Before Merge

| Rule | Server | Fix owner | Deadline | Status |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Review Rules

- Accept current findings only after a human reviewer understands the command, package, directory, URL, or credential flow.
- Do not baseline plaintext secrets, shell installers, privileged containers, Docker socket mounts, or broad filesystem access without a separate risk decision.
- Re-run the scan after every MCP config change.
- Keep the baseline visible in pull requests; it is not a suppression file for new risk.
