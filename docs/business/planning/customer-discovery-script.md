# Customer Discovery Script

## Goal

Learn whether teams using AI agents and MCP have real security pain, and whether they will pay for audit, hardening, or monitoring.

## Intro

I am researching security risks around AI agents and MCP servers. I am not trying to sell a SaaS yet. I want to understand how teams are connecting agents to tools, credentials, files, and internal systems.

## Questions

1. Which AI coding or agent tools are you using today?
2. Are you using MCP servers? If yes, which ones?
3. Who approves new MCP servers or agent tools on your team?
4. Do you know which credentials or environment variables those tools can access?
5. Have you had incidents or close calls involving leaked secrets, wrong file access, shell commands, or production changes?
6. What would make you comfortable letting agents access more powerful tools?
7. Would a scan report be useful before onboarding a new MCP server?
8. Would you prefer this in local CLI, CI, GitHub App, or hosted dashboard?
9. Who would pay for this: engineering, security, platform, founder?
10. If I found concrete risks in your setup, would you pay for remediation help?

## What To Listen For

- fear around secrets and credentials;
- uncertainty about what MCP servers can access;
- team policies that are informal or missing;
- desire for audit logs;
- need for CI checks;
- concern from founders or security leads.

## Close

I can run an early scanner on a redacted config and send back a short risk report. If it finds anything useful, I would like your feedback on the rules and output format.

