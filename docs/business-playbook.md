# Business Playbook

## Positioning

`mcp-guard` is the local-first security scanner for teams adopting AI agents and MCP servers.

The business is not the open-source CLI alone. The CLI creates trust and distribution. Near-term validation comes from early users running the scanner on real setups. Revenue can later come from private audits, remediation, and team workflows once those services are actually offered.

## Future Paid Offer

AI Agent/MCP Security Audit.

Do not advertise this as active until there is a clear delivery process, pricing, and availability.

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
