# Rule Reference

`mcp-guard` uses practical heuristics for the first public version. It is designed to surface risky MCP configuration quickly, not to prove a system is fully secure.

| Rule | Severity | What it detects |
| --- | --- | --- |
| MCP000 | Low | No MCP config files found in common locations. |
| MCP001 | High | Server has neither `command` nor `url`. |
| MCP002 | Medium | Config file has no `mcpServers` or `servers` object. |
| MCP003 | High | Config file cannot be parsed as JSON. |
| MCP010 | High/Critical | MCP server runs through a shell, especially with inline `-c`. |
| MCP011 | High | Interpreter eval mode such as `node -e` or `python -c`. |
| MCP020 | Medium | Remote package runner such as `npx`, `uvx`, `bunx`, or `pnpm dlx`. |
| MCP021 | High | Remote package runner without exact package version pinning. |
| MCP030 | High | Secret-like environment variable exposed to the MCP server. |
| MCP040 | Medium/High | Broad working directory such as home, root, Desktop, Documents, or Downloads. |
| MCP041 | Medium/High | Broad filesystem path passed in server arguments. |
| MCP050 | Critical | Dangerous command pattern such as `rm -rf`, `sudo`, `chmod 777`, or curl pipe to shell. |
| MCP060 | Medium | Remote MCP server URL configured. |
| MCP061 | High | Secret-like header configured for a remote MCP server. |

## Severity Model

- Critical: likely direct execution or credential safety risk.
- High: strong signal requiring review before use.
- Medium: risky default or missing governance.
- Low: informational issue.

## Limitations

- The scanner does not execute MCP servers.
- The scanner does not upload configs.
- Detection is heuristic and will miss some risks.
- A clean report is not a security guarantee.

