# Policy Files

Use a policy file when a team wants an explicit approval boundary for MCP servers, not just heuristic risk findings.

`mcp-guard scan` automatically loads `.mcp-guard-policy.json` from the working directory when the file exists. You can also pass a policy explicitly:

```bash
mcp-guard scan --config .mcp.json --policy .mcp-guard-policy.json --fail-on high
```

Disable automatic policy loading with:

```bash
mcp-guard scan --no-policy
```

## Example

```json
{
  "version": 1,
  "allowedCommands": ["node", "uvx"],
  "allowedPackages": ["@approved/mcp-server"],
  "allowedDirectories": ["./workspace"],
  "allowedRemoteUrls": ["https://approved.example.com"]
}
```

Each field is optional. Empty or omitted fields are not enforced.

## Fields

| Field | Meaning |
| --- | --- |
| `allowedCommands` | Approved command basenames, such as `node`, `docker`, or `uvx`. |
| `allowedPackages` | Approved remote-runner package names, without requiring a version suffix. |
| `allowedDirectories` | Approved filesystem roots. Relative paths resolve from the scan working directory. |
| `allowedRemoteUrls` | Approved remote MCP URL origins or path prefixes. |

## Policy Findings

| Rule | Severity | What it detects |
| --- | --- | --- |
| MCP070 | High | MCP server command is not in `allowedCommands`. |
| MCP071 | High | Remote package runner uses a package outside `allowedPackages`. |
| MCP072 | High | MCP server `cwd` is outside `allowedDirectories`. |
| MCP073 | High | Filesystem argument is outside `allowedDirectories`. |
| MCP074 | High | Remote MCP URL is outside `allowedRemoteUrls`. |

Policy findings are additive. A policy does not suppress the built-in rules for shell execution, unpinned packages, broad filesystem access, secret-like values, or dangerous commands.
