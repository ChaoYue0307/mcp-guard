# Product Roadmap

`mcp-guard` should stay narrow: local-first MCP and AI agent tool security that produces actionable reports.

## Now

- CLI config scanning.
- Text, Markdown, HTML, redacted JSON, and SARIF output.
- Rules for shell wrappers, remote package runners, unpinned packages, broad filesystem access, secret-like env vars/headers, and remote MCP URLs.
- CI usage with `--fail-on`.
- GitHub Action wrapper that writes a job summary, uploads Markdown/HTML/JSON/SARIF artifacts, and can upload SARIF to GitHub code scanning.
- Baseline/allowlist mode for accepting known findings and failing only on new risks.
- Optional GitHub pull request comments from the Marketplace Action.
- `mcp-guard init` for bootstrapping a GitHub Action workflow and optional baseline.
- Policy file enforcement for approved commands, packages, directories, and remote URLs.
- npm Trusted Publishing workflow prepared for tokenless release publishing.

## Next

1. More MCP client discovery paths.
2. Rule packs mapped to MCP security best practices.
3. `mcp-guard audit` mode for review-ready reports.
4. Safer default remediation snippets for common MCP servers.

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
