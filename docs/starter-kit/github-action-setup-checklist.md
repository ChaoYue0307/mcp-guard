# GitHub Action Setup Checklist

Use this checklist when adding `mcp-guard` to a private repository.

## Before Opening the Pull Request

- [ ] Identify the MCP config path, such as `.mcp.json`, `.cursor/mcp.json`, or `.vscode/mcp.json`.
- [ ] Run `mcp-guard scan` locally and review findings.
- [ ] Create `.mcp-guard-policy.json` from `policy-template.json`.
- [ ] Generate `.mcp-guard-baseline.json` only after reviewing accepted findings.
- [ ] Confirm no secrets, tokens, private config values, or generated reports with raw secrets are committed.

## Workflow

Start with:

```sh
mcp-guard init --config .mcp.json --baseline --sarif
```

Then review `.github/workflows/mcp-guard.yml`:

- [ ] `fail-on` is at least `high` for active findings.
- [ ] `comment-pr` is enabled for review visibility.
- [ ] `upload-sarif` is enabled when GitHub code scanning is available.
- [ ] `policy` points to `.mcp-guard-policy.json`.
- [ ] `baseline` points to `.mcp-guard-baseline.json`.
- [ ] Pro repositories pass `license-endpoint`, `license-key`, and `license-email` when license gating is enabled.
- [ ] `license-key` comes from `secrets.MCP_GUARD_LICENSE_KEY`, not from committed workflow text.

Optional Pro license gate:

```yaml
license-endpoint: https://YOUR_WORKER_URL/license/verify
license-key: ${{ secrets.MCP_GUARD_LICENSE_KEY }}
license-email: buyer@example.com
```

## Pull Request Checks

- [ ] The Action fails on a deliberately risky test branch.
- [ ] Pro license verification passes before scan reports are generated.
- [ ] PR comment shows active findings and accepted baseline findings.
- [ ] SARIF upload succeeds or is intentionally disabled.
- [ ] The generated artifact contains Markdown, HTML, JSON, SARIF, and audit pack files.
- [ ] Reviewers know how to update the policy and baseline.
