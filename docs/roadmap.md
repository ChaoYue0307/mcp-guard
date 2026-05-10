# Product Roadmap

`mcp-guard` should stay narrow: local-first MCP and AI agent tool security that produces actionable reports.

## Now

- CLI config scanning.
- Text, Markdown, and redacted JSON output.
- Rules for shell wrappers, remote package runners, unpinned packages, broad filesystem access, secret-like env vars/headers, and remote MCP URLs.
- CI usage with `--fail-on`.

## Next

1. GitHub Action wrapper.
2. HTML audit report.
3. More MCP client discovery paths.
4. Rule packs mapped to MCP security best practices.
5. `mcp-guard audit` mode for client-ready reports.

## Later

1. Policy file: approved commands, packages, directories, and remote URLs.
2. Baseline mode: accept known findings and fail only on new risks.
3. SBOM/package metadata checks for MCP server packages.
4. Local web report viewer.
5. Hosted team dashboard only after repeated paid audit demand.

## Product Principles

- Local-first by default.
- Findings must include a fix.
- Avoid noisy rules that do not change behavior.
- Prefer workflow integration over dashboards.
- Services first, SaaS later.

