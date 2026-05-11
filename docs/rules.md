# Rule Reference

`mcp-guard` uses practical heuristics for the first public version. It is designed to surface risky MCP configuration quickly, not to prove a system is fully secure.

The same catalog is available from the CLI:

```bash
mcp-guard rules
mcp-guard rules --format markdown
mcp-guard rules --format json
```

| Rule | Severity | Title | What it detects | Recommended response |
| --- | --- | --- | --- | --- |
| MCP000 | Low | No MCP config files found | No MCP config files were found in common project, Cursor, VS Code, or Claude Desktop locations. | Pass `--config` when the MCP config lives outside default discovery paths. |
| MCP001 | High | Server has no command or URL | An MCP server entry has neither `command` nor `url`. | Remove the server or define an explicit command or URL with reviewed settings. |
| MCP002 | Medium | Config has no MCP servers object | A config file does not contain an `mcpServers` or `servers` object. | Check that the file is the intended MCP config before relying on the scan. |
| MCP003 | High | Config cannot be parsed as JSON | A config file could not be parsed as JSON. | Fix the JSON syntax so the scanner and MCP client can read the same config. |
| MCP010 | High/Critical | MCP server runs through a shell | Shell wrappers such as `sh`, `bash`, `zsh`, `fish`, PowerShell, or `cmd`, especially inline scripts. | Use a direct, pinned executable instead of a shell wrapper. |
| MCP011 | High | Interpreter eval mode is enabled | Interpreter eval flags such as `node -e`, `python -c`, `ruby -e`, or similar inline code execution. | Replace inline code with a reviewed package or checked-in script. |
| MCP020 | Medium | Remote package runner is used | Remote package runners such as `npx`, `uvx`, `bunx`, `pipx run`, `npm exec`, or package-manager `dlx` commands. | Pin the package version and prefer a reviewed lockfile or vendored executable for sensitive tools. |
| MCP021 | High | Remote MCP package is not version pinned | Remote package execution without an exact package version. | Pin the package to an exact version such as `package@1.2.3` and review updates before changing it. |
| MCP030 | High | Secret-like environment variable is exposed | Secret-like environment variable names or values passed into an MCP server. | Use least-privilege, short-lived credentials and dedicated service accounts. |
| MCP031 | Medium | Environment file is loaded into MCP server | An MCP server uses `envFile` to load environment variables from a file. | Review the env file before enabling this server and keep credentials least-privileged, scoped, and rotated. |
| MCP040 | Medium/High | MCP server has a broad working directory | Broad working directories such as home, root, Desktop, Documents, or Downloads. | Run the server in a narrow project directory or sandbox with only the files it needs. |
| MCP041 | Medium/High | MCP server argument grants broad filesystem access | Filesystem arguments that grant broad access to home, root, or sensitive user folders. | Replace broad filesystem paths with a dedicated project folder or read-only sandbox path. |
| MCP050 | Critical | Command includes a dangerous operation | Dangerous command patterns such as `rm -rf`, `sudo`, `chmod 777`, force push, or curl-pipe-shell. | Remove dangerous startup operations and run setup steps manually after review. |
| MCP060 | Medium | Remote MCP server URL is configured | Remote HTTP or HTTPS MCP server URLs. | Verify the provider, document data sent to the server, and keep an allowlist of approved endpoints. |
| MCP061 | High | Secret-like header is configured | Secret-like remote MCP headers such as authorization or API key headers. | Use scoped, short-lived credentials and avoid long-lived secrets in MCP config files. |
| MCP062 | High | Remote MCP server uses plaintext HTTP | A remote MCP server URL starts with `http://` instead of `https://`. | Use an HTTPS MCP endpoint, or tunnel this connection through a trusted encrypted channel. |
| MCP070 | High | Command is outside policy | An MCP server command that is not listed in `allowedCommands`. | Use an approved command or update policy only after review. |
| MCP071 | High | Remote package is outside policy | A remote MCP package that is not listed in `allowedPackages`. | Use an approved package or update policy only after package review. |
| MCP072 | High | Working directory is outside policy | A server working directory outside `allowedDirectories`. | Move the server into an approved workspace or update policy only after review. |
| MCP073 | High | Filesystem argument is outside policy | A filesystem argument outside `allowedDirectories`. | Limit filesystem arguments to approved directories or update policy only after review. |
| MCP074 | High | Remote MCP URL is outside policy | A remote MCP endpoint outside `allowedRemoteUrls`. | Use an approved endpoint or update policy only after remote provider review. |

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
