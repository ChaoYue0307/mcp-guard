# Business Playbook

## Positioning

`mcp-guard` is the local-first security scanner for teams adopting AI agents and MCP servers.

The business is not the open-source CLI alone. The CLI creates trust and distribution. Revenue should start with a self-serve Stripe checkout for packaged deliverables, then expand into setup help and team workflow integration.

## Self-Serve Product Ladder

| Offer | Price | Buyer | What they get |
| --- | ---: | --- | --- |
| MCP Audit Starter Kit | USD 49 one-time | Solo founder or indie hacker | Templates, GitHub Action setup checklist, audit handoff template, and rollout guide. |
| mcp-guard Pro | USD 19/month | Team using private repos | Private repo license gate, maintained policy templates, priority MCP examples, and recurring updates. |
| Team Setup Package | USD 199 one-time | Startup team | One repo setup package with CLI, Action, policy, baseline, SARIF, PR comments, and verified audit pack. |

Use Stripe Payment Links first so customers can pay without a sales call. The website reads live checkout URLs from `site/checkout.js`, and `npm run payments:check -- --live` verifies the links, success page, legal/refund page, and Starter Kit deliverables before launch. `examples/stripe-fulfillment-worker/` is the starter backend for webhook signature verification, fulfillment email, Pro license storage, and private license verification. The CLI and GitHub Action can now call `mcp-guard license verify` so Pro has a concrete private-repo entitlement path.

## Near-Term Paid Offer

MCP Guard CI Setup Sprint.

This is setup and product onboarding, not a manual security audit.

Deliverables:

- install the CLI and GitHub Action;
- run `mcp-guard init` or generate an equivalent workflow manually;
- generate Markdown, HTML, JSON, and SARIF reports;
- generate a customer handoff audit pack with executive summary, remediation plan, remediation checklist, reports, hashed manifest, and verifier output;
- define an initial `.mcp-guard-policy.json` for approved commands, packages, directories, and remote URLs;
- create an initial baseline for accepted known findings;
- enable PR comments and optional SARIF upload;
- configure the Pro license gate when the customer is on a paid private-repo plan;
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

It checks for risky shell access, unpinned npx packages, broad filesystem permissions, exposed secrets, high-risk Docker/Podman runtime options, and remote MCP servers.

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
