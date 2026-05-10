# Business Playbook

## Positioning

`mcp-guard` is the local-first security scanner for teams adopting AI agents and MCP servers.

The business is not the open-source CLI alone. The CLI creates trust and distribution. Near-term validation comes from early users running the scanner on real setups. Revenue can start with setup help and team workflow integration before offering broader manual audits.

## Near-Term Paid Offer

MCP Guard CI Setup Sprint.

This is setup and product onboarding, not a manual security audit.

Deliverables:

- install the CLI and GitHub Action;
- run `mcp-guard init` or generate an equivalent workflow manually;
- generate Markdown, HTML, JSON, and SARIF reports;
- generate a customer handoff audit pack with executive summary, remediation plan, reports, and manifest;
- define an initial `.mcp-guard-policy.json` for approved commands, packages, directories, and remote URLs;
- create an initial baseline for accepted known findings;
- enable PR comments and optional SARIF upload;
- document missing rule requests for future product work;
- provide a short setup handoff note.

For product operations, npm Trusted Publishing should be used after the package setting is configured. This avoids manual QR-code publish flows and makes small releases repeatable.

## Pricing

| Customer | Price |
| --- | ---: |
| Solo founder / indie team | USD 199-500 |
| Small startup | USD 750-2,000 |
| Funded team / private deployment pilot | USD 2,000-5,000 |

## Outreach Copy

```text
I built mcp-guard, an open-source local scanner for MCP and AI agent tool configs.

It checks for risky shell access, unpinned npx packages, broad filesystem permissions, exposed secrets, and remote MCP servers.

It now includes `mcp-guard init`, which creates a GitHub Action workflow, can generate a baseline for accepted current findings, can enforce a committed policy for approved MCP commands, packages, directories, and URLs, and can export a review-ready audit pack.

I am collecting real-world MCP and AI agent config patterns from teams using Claude, Cursor, Codex, or MCP in production-like workflows. If you can share a redacted config or run the CLI locally, your feedback can help improve the scanner's rules and reports.
```

## First 20 Targets

- MCP server authors.
- AI automation agencies.
- Devtool startups using MCP.
- Teams publishing agent demos with real tool access.
- Founders discussing Cursor, Claude Code, Codex, or MCP on GitHub, X, LinkedIn, Hacker News, or Discord.

## Validation Signals

Strong:

- user shares real redacted config;
- user asks for CI integration;
- user asks whether a finding is exploitable;
- user pays for remediation;
- team asks for monthly scanning.

Weak:

- stars without config samples;
- vague security interest;
- requests for a full dashboard before any audit;
- only free users with toy configs.
