# Trusted Publishing

`mcp-guard` includes a GitHub Actions workflow for npm Trusted Publishing so future releases can publish without npm browser QR links, OTP prompts, or long-lived npm tokens.

## Why

npm browser authentication links can expire quickly and may open as 404. Trusted Publishing lets npm accept a publish from a specific GitHub Actions workflow through OIDC.

The workflow is committed at:

```text
.github/workflows/publish-npm.yml
```

It uses:

- `permissions: id-token: write`
- `actions/checkout@v6`
- `actions/setup-node@v6`
- Node.js 24
- `npm publish --access public`

## npm Package Settings

Configure this once on npmjs.com:

| Field | Value |
| --- | --- |
| Package | `agent-mcp-guard` |
| Publisher | GitHub Actions |
| Organization or user | `ChaoYue0307` |
| Repository | `mcp-guard` |
| Workflow filename | `publish-npm.yml` |
| Environment name | leave empty |

After this is saved, run the workflow from GitHub Actions with the release tag, for example:

```text
v0.4.5
```

## Release Flow After Setup

1. Update `package.json` and `src/cli.js`.
2. Run `npm test` and `npm run release:check`.
3. Commit and push to `main`.
4. Create a GitHub release tag such as `v0.4.5`.
5. Run the `Publish npm` workflow with the same tag.
6. Verify npm:

```bash
npm view agent-mcp-guard version
```

## Troubleshooting

- The workflow filename configured on npm must be exactly `publish-npm.yml`.
- The package `repository.url` must match `https://github.com/ChaoYue0307/mcp-guard`.
- The workflow must run on GitHub-hosted runners.
- The workflow must keep `id-token: write`.
- If npm says authentication failed, re-check the npm Trusted Publisher fields before retrying.
