# Operator Runbook

This is the step-by-step launch path for the project owner.

## 1. Local Verification

From the repo root:

```bash
npm test
npm run release:check
npm --cache ./.npm-cache pack --dry-run
node ./bin/mcp-guard.js scan --config examples/unsafe-claude_desktop_config.json
```

If your global npm cache has permission errors, either keep using the local cache flag above or fix ownership:

```bash
sudo chown -R "$(id -u)":"$(id -g)" ~/.npm
```

## 2. Create GitHub Repository

Create an empty public GitHub repo named:

```text
mcp-guard
```

Do not initialize it with a README, license, or `.gitignore`; this local project already has them.

Then run:

```bash
git init -b main
git add .
git commit -m "Initial mcp-guard CLI"
git remote add origin git@github.com:<your-username>/mcp-guard.git
git push -u origin main
```

Or use the helper after `gh auth login`:

```bash
npm run launch:github
```

## 3. Publish To npm

The product and CLI command are `mcp-guard`, but the npm package name is:

```text
agent-mcp-guard
```

`mcp-guard` is already taken on npm, so do not publish under that name.

Confirm the package name is still available:

```bash
npm view agent-mcp-guard
```

If it is available, login and publish:

```bash
npm login
npm publish --access public
```

If npm cache permission errors appear, use:

```bash
npm --cache ./.npm-cache publish --access public
```

Or use the helper after `npm login`:

```bash
npm run publish:npm
```

## 4. First Public Post

Short launch copy:

```text
I just open-sourced mcp-guard, a local-first CLI that scans MCP server configs for risky AI agent permissions: shell wrappers, unpinned npx packages, broad filesystem access, exposed secrets, and remote MCP servers.

npm install -g agent-mcp-guard
mcp-guard scan
```

## 5. First Sales Motion

Send this to 20 teams using MCP or AI agents:

```text
I am building mcp-guard, an open-source security scanner for MCP and AI agent tool configs. It checks for risky shell access, unpinned remote packages, over-broad file permissions, exposed secrets, and unsafe remote server setup.

I am collecting real-world MCP config patterns from teams using agents in real workflows. If you can share a redacted config or run the CLI locally, your feedback can help improve the scanner's rules and reports.
```
