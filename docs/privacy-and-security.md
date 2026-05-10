# Privacy And Security

## Default Behavior

`mcp-guard` is local-first.

- It reads MCP config files from disk.
- It does not upload config files.
- It does not call external APIs.
- It redacts secret-like environment values and headers in reports.

## Sensitive Data

MCP configs may contain tokens, API keys, local paths, usernames, and internal hostnames. Treat generated reports as sensitive unless you have reviewed them.

## Recommended Use

- Run locally before sharing a report.
- Remove unnecessary MCP servers.
- Use dedicated service accounts and scoped tokens.
- Prefer pinned package versions.
- Avoid broad filesystem paths such as home, root, Desktop, Documents, or Downloads.
- Avoid shell wrappers and inline scripts for MCP server startup.

## Disclaimer

This project is an assistive security review tool. It does not guarantee that all vulnerabilities, malicious packages, data leaks, or unsafe configurations will be found.

