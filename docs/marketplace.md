# GitHub Marketplace Plan

GitHub Marketplace has stricter packaging rules than normal action usage. The main `mcp-guard` repository should stay as the product repository because it contains the CLI, website, tests, CI, Pages, docs, and examples.

Official GitHub docs: https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace

Use a dedicated public repository for Marketplace:

```text
ChaoYue0307/mcp-guard-action
```

## Why a Dedicated Repository

GitHub requires Marketplace action repositories to:

- be public;
- contain a single root `action.yml` or `action.yaml`;
- have a unique action metadata `name`;
- avoid workflow files in the repository.

The main repo intentionally contains `.github/workflows`, so it should not be the Marketplace repo.

## Prepared Action Package

Generate the clean action repository payload:

```bash
npm run marketplace:prepare
```

This creates:

```text
dist/mcp-guard-action/
```

The generated directory includes only the files needed by the action:

- `action.yml`
- `README.md`
- `LICENSE`
- `package.json`
- `bin/`
- `src/`
- `scripts/action-summary.js`

It intentionally excludes `.github/workflows`.

## Recommended Marketplace Metadata

Repository name:

```text
mcp-guard-action
```

Action name:

```text
mcp-guard MCP Security Scanner
```

Description:

```text
Scan MCP and AI agent tool configuration for risky commands, leaked secrets, broad filesystem access, remote endpoints, and unpinned packages.
```

Primary category:

```text
Security
```

Secondary category:

```text
Code quality
```

Release title:

```text
v0.3.0
```

Release notes:

```text
Initial Marketplace-ready release.

- Runs mcp-guard from the pinned action tag.
- Generates Markdown, HTML, JSON, and SARIF reports.
- Writes a GitHub Step Summary for pull request review.
- Can upload SARIF to GitHub code scanning with `upload-sarif: "true"`.
- Fails workflows by configurable severity threshold.
```

## Manual Publishing Steps

1. Create the public repository `ChaoYue0307/mcp-guard-action`.
2. Copy the generated `dist/mcp-guard-action/` contents into that repository.
3. Commit and push the files.
4. Open `action.yml` on GitHub and click the Marketplace banner.
5. Draft a release with tag `v0.3.0`.
6. Select `Publish this Action to the GitHub Marketplace`.
7. Accept the GitHub Marketplace Developer Agreement if prompted.
8. Choose `Security` as the primary category.
9. Publish the release with 2FA.

After publishing, update the main README and website usage snippets from:

```yaml
- uses: ChaoYue0307/mcp-guard@v0.3.0
```

to:

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.3.0
```
