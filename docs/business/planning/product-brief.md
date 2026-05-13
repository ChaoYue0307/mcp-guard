# Product Brief: mcp-guard

## Positioning

`mcp-guard` is a security scanner and runtime policy layer for teams using AI agents and MCP servers.

It starts as a CLI that audits local MCP configuration and generates a practical risk report. Later it can become a local proxy/gateway that enforces policies before an agent calls tools.

## Core Promise

Before your AI agent runs tools against your files, shell, repos, credentials, or SaaS accounts, `mcp-guard` tells you what is risky and helps you lock it down.

## MVP User Story

As a developer using MCP servers, I can run:

```bash
mcp-guard scan
```

Then I get:

- a list of MCP servers found;
- commands and environment variables each server can access;
- detected secrets or dangerous patterns;
- a risk score;
- specific remediation steps.

## Differentiation

Most agent tooling focuses on capability. `mcp-guard` focuses on risk, governance, and auditability.

## Non-Goals For MVP

- Do not build a full enterprise dashboard first.
- Do not support every agent framework immediately.
- Do not attempt perfect malware detection.
- Do not become a generic secrets scanner.

## First Supported Inputs

- Claude Desktop MCP config.
- Cursor MCP config.
- Common `.mcp.json` files.
- Environment files such as `.env`, with safe redaction.
- Package metadata for local MCP servers where easy to inspect.

