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

Completed:

- Public repository created: <https://github.com/ChaoYue0307/mcp-guard-action>
- `dist/mcp-guard-action/` exported, committed, and pushed.
- Release created: <https://github.com/ChaoYue0307/mcp-guard-action/releases/tag/v0.3.0>
- README, docs, and website examples now use:

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.3.0
```

Remaining Marketplace web step:

1. Open `action.yml` or the release page on GitHub and click the Marketplace banner.
2. Select `Publish this Action to the GitHub Marketplace`.
3. Accept the GitHub Marketplace Developer Agreement if prompted.
4. Choose `Security` as the primary category.
5. Publish the release with 2FA.
