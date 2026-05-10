# Business Playbook

## Positioning

`mcp-guard` is the local-first security scanner for teams adopting AI agents and MCP servers.

The business is not the open-source CLI alone. The CLI creates trust and distribution. Revenue comes from private audits, remediation, and eventually team workflows.

## First Paid Offer

AI Agent/MCP Security Audit.

Deliverables:

- MCP server inventory;
- `mcp-guard` Markdown, HTML, JSON, and SARIF scan reports;
- manual review of high-risk findings;
- prioritized remediation plan;
- optional GitHub Action setup for continuous scans;
- 60-minute hardening call;
- optional PR with safer config changes.

## Pricing

| Customer | Price |
| --- | ---: |
| Solo founder / indie team | USD 300-800 |
| Small startup | USD 1,000-3,000 |
| Funded team / private deployment pilot | USD 3,000-8,000 |

## Outreach Copy

```text
I built mcp-guard, an open-source local scanner for MCP and AI agent tool configs.

It checks for risky shell access, unpinned npx packages, broad filesystem permissions, exposed secrets, and remote MCP servers.

I am doing a few early MCP security audits for teams using Claude, Cursor, Codex, or MCP in real workflows. If you send a redacted config or run the CLI locally, I can help interpret the report and suggest hardening steps.
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
