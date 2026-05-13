# MVP Scope

## Week 1: Useful CLI

Build a CLI that can:

- discover common MCP config files;
- parse JSON configs safely;
- list installed MCP servers;
- inspect command, args, env, cwd, and package references;
- flag risky patterns;
- generate a Markdown report.

## Risk Rules V1

Flag these issues first:

- shell execution through `sh`, `bash`, `zsh`, `python -c`, `node -e`;
- broad filesystem access such as `/`, home directory, Desktop, Documents, Downloads;
- environment variables that look like API keys or tokens;
- network-capable tools without clear destination allowlist;
- package execution through `npx` or remote package fetch;
- missing version pinning;
- use of personal GitHub, Slack, Dropbox, Google, or database credentials;
- commands that can modify Git history or deploy production systems.

## Output

Each scan should produce:

- `summary`: high/medium/low issue counts;
- `inventory`: MCP servers and their commands;
- `findings`: risk, evidence, why it matters, fix;
- `next_steps`: practical hardening checklist.

## Technical Shape

Preferred MVP stack:

- TypeScript CLI;
- Node.js runtime;
- `zod` for config validation;
- `commander` or `clipanion` for CLI;
- Markdown report first, HTML later.

## Success Criteria

Within 7-10 days:

- one public GitHub repo;
- one demo scan report;
- one checklist post;
- 20 targeted outbound messages;
- at least 3 calls or async feedback threads.

