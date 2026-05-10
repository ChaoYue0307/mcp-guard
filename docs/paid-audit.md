# Future Service Concept

This is a planning note for a possible future service attached to `mcp-guard`.

It is not currently advertised as an active consulting service. Keep public website and README copy focused on the automated scanner, early pilots, and CI setup feedback until this offer is actually available.

## Who It Is For

- Teams using Claude Desktop, Cursor, Codex, Windsurf, or custom AI agents.
- Teams installing MCP servers from public registries.
- Startups connecting agents to GitHub, Slack, databases, browsers, files, or production tools.

## Deliverables

- MCP and agent tool inventory.
- `mcp-guard audit` evidence pack with executive summary, remediation plan, remediation checklist, reports, and manifest.
- Risk report covering shell access, package execution, filesystem scope, secrets, remote servers, and dangerous commands.
- Practical remediation checklist.
- Optional PR with safer config and policy changes.
- 60-minute hardening call.

Use `docs/templates/audit-report-template.md` as the starting point for client delivery.

## Suggested Pricing

- Indie or solo founder: USD 300-800.
- Small startup: USD 1,000-3,000.
- Funded team or private deployment pilot: USD 3,000-8,000.

## Draft Sales Copy

I am building `mcp-guard`, an open-source scanner for MCP and AI agent tool security. It checks for risky shell access, unpinned remote packages, over-broad file permissions, exposed secrets, and unsafe remote server setup. I am collecting real-world config patterns from teams using agents in real workflows.
