# Product Roadmap

`mcp-guard` should stay narrow: local-first MCP and AI agent tool security that produces actionable reports.

## Now

- CLI config scanning.
- Default discovery for project, parent, Cursor, VS Code, and Claude Desktop MCP config paths.
- Text, Markdown, HTML, redacted JSON, and SARIF output.
- Rules for shell wrappers, remote package runners, unpinned packages, broad filesystem access, secret-like env vars/env files/headers, and remote MCP URLs.
- CI usage with `--fail-on`.
- GitHub Action wrapper that writes a job summary, uploads Markdown/HTML/JSON/SARIF artifacts, and can upload SARIF to GitHub code scanning.
- Baseline/allowlist mode for accepting known findings and failing only on new risks.
- Optional GitHub pull request comments from the Marketplace Action.
- `mcp-guard init` for bootstrapping a GitHub Action workflow and optional baseline.
- Policy file enforcement for approved commands, packages, directories, and remote URLs.
- Conservative policy draft generation with `mcp-guard policy`.
- `mcp-guard audit` and `mcp-guard verify-audit` for review-ready summaries, remediation plans, checklists, reports, and verifiable manifests.
- npm Trusted Publishing workflow prepared for tokenless release publishing.

## Next

1. Additional MCP client discovery paths from real user configs.
2. Rule packs mapped to MCP security best practices.
3. Safer default remediation snippets for common MCP servers.
4. Package metadata checks for remote MCP server packages.

## Later

1. SBOM/package metadata checks for MCP server packages.
2. Local web report viewer.
3. Hosted team dashboard only after repeated paid audit demand.

## Product Principles

- Local-first by default.
- Findings must include a fix.
- Avoid noisy rules that do not change behavior.
- Prefer workflow integration over dashboards.
- Services first, SaaS later.
