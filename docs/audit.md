# Audit Packs

`mcp-guard audit` generates a review-ready evidence package for setup pilots, internal security reviews, and customer handoff notes.

It runs the same scanner as `mcp-guard scan`, then writes a directory with human-readable reports, machine-readable outputs, and a manifest.

## Usage

```bash
mcp-guard audit --config .mcp.json --policy .mcp-guard-policy.json --output-dir mcp-guard-audit
```

Use a baseline when the team has accepted known findings:

```bash
mcp-guard audit \
  --config .mcp.json \
  --baseline .mcp-guard-baseline.json \
  --policy .mcp-guard-policy.json \
  --output-dir mcp-guard-audit
```

Use `--fail-on` in CI when the audit should write artifacts and then fail on active risk:

```bash
mcp-guard audit --config .mcp.json --fail-on high
```

Verify the audit pack before handoff or after downloading a CI artifact:

```bash
mcp-guard verify-audit --manifest mcp-guard-audit/mcp-guard-audit-manifest.json
```

`verify-audit` recalculates every recorded artifact size and SHA-256 hash. It exits `0` when the pack still matches the manifest and exits `2` when a report is missing or changed.

## Generated Files

| File | Purpose |
| --- | --- |
| `mcp-guard-executive-summary.md` | Short decision summary for founders, security leads, and engineering managers. |
| `mcp-guard-remediation.md` | Server-by-server remediation plan with evidence and fixes. |
| `mcp-guard-remediation-checklist.md` | Checkbox-based remediation tasks for PRs, paid setup handoff, or internal tracking. |
| `mcp-guard-report.md` | Full Markdown scan report. |
| `mcp-guard-report.html` | Readable HTML report for review artifacts. |
| `mcp-guard-report.json` | Redacted machine-readable report for automation. |
| `mcp-guard.sarif` | SARIF 2.1.0 report for GitHub code scanning. |
| `mcp-guard-audit-manifest.json` | Manifest listing status, summary, policy/baseline context, file paths, SHA-256 hashes, and artifact sizes. |

## Review Flow

1. Run `mcp-guard audit` locally or through the GitHub Action.
2. Open `mcp-guard-executive-summary.md` to decide whether the MCP setup is acceptable.
3. Work through `mcp-guard-remediation.md` with the engineering team.
4. Track concrete work in `mcp-guard-remediation-checklist.md`.
5. Use `mcp-guard-report.html` for readable evidence and `mcp-guard-report.json` or `mcp-guard.sarif` for automation.
6. Run `mcp-guard verify-audit --manifest mcp-guard-audit/mcp-guard-audit-manifest.json` when you need to prove an audit artifact has not changed.
7. Commit a reviewed policy and baseline only after the team has decided what risk is intentionally accepted.

## Privacy

The audit pack is generated locally. Secret-like environment variables and headers are redacted in reports before they are written.
