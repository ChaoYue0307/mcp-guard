# MCP Audit Starter Kit

This starter kit is the concrete delivery package behind the self-serve Starter Kit offer.

It is designed for a founder or small team that wants to add `mcp-guard` to one private repository without designing the rollout process from scratch.

## Included Files

| File | Purpose |
| --- | --- |
| `policy-template.json` | Conservative `.mcp-guard-policy.json` starting point. |
| `baseline-review-template.md` | Review worksheet for accepting current findings without hiding future risk. |
| `github-action-setup-checklist.md` | Pull request checklist for wiring the GitHub Action safely. |
| `audit-handoff-template.md` | Customer or internal handoff template for the generated audit pack. |
| `private-repo-rollout-guide.md` | Step-by-step rollout plan for a private repository. |

## Fast Path

1. Copy `policy-template.json` to `.mcp-guard-policy.json`.
2. Run `npm i -D agent-mcp-guard` or use the global CLI.
3. Run `mcp-guard scan --config .mcp.json --format html --output mcp-guard-report.html`.
4. Review active findings and fill out `baseline-review-template.md`.
5. Add the GitHub Action with `mcp-guard init --config .mcp.json --baseline --sarif`.
6. Attach the generated report and filled handoff template to the rollout issue.

Keep secrets, tokens, private configs, and raw customer payloads out of this folder. Use redacted snippets in any shared handoff.
