# Private Repository Rollout Guide

This guide turns `mcp-guard` into a repeatable private-repo guardrail.

## Phase 1: Inventory

1. Identify every MCP config file in the repository and editor folders.
2. Run discovery from the repo root:

```sh
mcp-guard scan --format markdown --output mcp-guard-initial-report.md
```

3. Confirm the scanner finds the expected project, parent, editor, and user-level configs.

## Phase 2: Policy

1. Copy `policy-template.json` to `.mcp-guard-policy.json`.
2. Add only reviewed commands, packages, directories, and remote URLs.
3. Keep broad root or home directory access out of the initial policy.
4. Keep shell wrappers and privileged container runtimes out of the initial policy.

## Phase 3: Baseline

1. Generate a baseline only after reviewing current findings.
2. Fill out `baseline-review-template.md`.
3. Commit the baseline with the policy and Action workflow.
4. Treat the baseline as accepted current risk, not as a permanent exemption.

## Phase 4: CI

1. Add the GitHub Action.
2. Start with `fail-on: high`.
3. Enable PR comments for reviewer visibility.
4. Enable SARIF upload where code scanning is available.
5. Confirm a test pull request fails when new high-risk MCP config is introduced.

## Phase 5: Operating Rhythm

- Re-run `mcp-guard policy --dry-run` when MCP servers change.
- Review baseline entries monthly or when ownership changes.
- Keep `mcp-guard` and the GitHub Action tag current.
- Track repeated false positives as upstream rule feedback.
- Never email or paste raw secrets in support requests.
