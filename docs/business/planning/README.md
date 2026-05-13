# AI Agent/MCP Security Gateway

## One-Liner

An open-source CLI and local gateway that helps teams find, block, and audit risky MCP servers and AI agent tool usage before secrets, shell access, or dangerous permissions cause damage.

## Problem

Developers are connecting AI agents to local files, shells, GitHub, databases, browsers, Slack, and internal tools. The default workflow is fast but often lacks:

- clear permission boundaries;
- secrets detection;
- command allowlists;
- audit logs;
- policy review before tool execution;
- team-level visibility into which MCP servers are installed.

## Initial Users

- AI-native startups using Cursor, Claude Code, Codex, Windsurf, or custom agents.
- Devtool teams building MCP servers.
- Security-conscious engineering teams experimenting with AI agents.
- Consultants who need to audit client AI workflows.

## Open Source Core

- Scan local MCP config files.
- Detect risky command patterns.
- Detect leaked secrets and over-broad environment variables.
- Score MCP servers by risk.
- Generate text, Markdown, and redacted JSON security reports.
- Provide a policy file format for allowed tools, commands, domains, and env vars.

## Paid Layers

- One-time AI agent security audit.
- Private hardening session for teams.
- Hosted monitoring dashboard.
- Private deployment with custom policies.
- Enterprise rules and compliance reports.

## Suggested Name Ideas

- `mcp-guard`
- `agent-guardrail`
- `mcp-sentinel`
- `toolwall`
- `agent-perimeter`

Working name for now: `mcp-guard`.

## Implementation Status

Local workspace: `/Users/chaoyue/Library/CloudStorage/Dropbox/OPC/mcp-guard-project`

Local repos:

- main product repo: `/Users/chaoyue/Library/CloudStorage/Dropbox/OPC/mcp-guard-project/mcp-guard`
- Marketplace action repo: `/Users/chaoyue/Library/CloudStorage/Dropbox/OPC/mcp-guard-project/mcp-guard-action`
- demo repo: `/Users/chaoyue/Library/CloudStorage/Dropbox/OPC/mcp-guard-project/mcp-guard-demo`

Current published version:

- local-first Node.js CLI;
- scans Claude Desktop, Cursor, and project MCP config shapes;
- supports explicit `--config` scans;
- outputs text, Markdown, HTML, redacted JSON, and SARIF reports;
- includes a deterministic reusable GitHub Action for PR/CI scanning, job summaries, report artifacts, and optional SARIF upload to GitHub code scanning;
- includes CI config, GitHub Pages, tests, examples, Apache-2.0 license, operator runbook, roadmap, security policy, contribution guide, and business playbook;
- published GitHub repo: `https://github.com/ChaoYue0307/mcp-guard`;
- current npm registry package: `agent-mcp-guard@0.2.0`;
- GitHub Pages site: `https://chaoyue0307.github.io/mcp-guard/`;
- latest GitHub release: `https://github.com/ChaoYue0307/mcp-guard/releases/tag/v0.3.0`;
- npm `0.3.0` is prepared locally and in GitHub, but final registry publish requires the account owner to complete npm 2FA.

Install:

```bash
npm install -g agent-mcp-guard
mcp-guard scan
```

Next owner action:

1. Share the GitHub/npm links with 10-20 early users.
2. Offer free config scans for feedback.
3. Convert serious findings into paid MCP security audits.
