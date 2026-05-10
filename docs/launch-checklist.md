# Launch Checklist

## Before Public Launch

- [ ] Create GitHub repository.
- [ ] Push the local project.
- [ ] Confirm CI passes.
- [ ] Choose final package name on npm.
- [ ] Run `npm pack --dry-run`.
- [ ] Publish with `npm publish --access public`.
- [ ] Generate fresh sample report with `npm run scan:example`.
- [ ] Add screenshots or paste report excerpt into README.
- [ ] Finish the GitHub Marketplace web publishing step for `mcp-guard-action`.
- [ ] Post a short technical article or launch note.
- [ ] Contact 20 early users for scan feedback, missing rules, and CI setup needs.
- [ ] Follow the detailed steps in `docs/operator-runbook.md`.

## User Setup

```bash
npm install -g agent-mcp-guard
mcp-guard scan
```

## CI Setup

```bash
mcp-guard scan --config .mcp.json --fail-on high
```

## Audit Pack

```bash
mcp-guard audit --config .mcp.json --policy .mcp-guard-policy.json --output-dir mcp-guard-audit
mcp-guard verify-audit --manifest mcp-guard-audit/mcp-guard-audit-manifest.json
```

## GitHub Action Setup

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.4.8
  with:
    config: .mcp.json
    baseline: .mcp-guard-baseline.json
    fail-on: high
    comment-pr: "true"
    upload-sarif: "true"
```

Exit codes:

- `0`: scan completed and did not hit the fail threshold.
- `1`: CLI usage or runtime error.
- `2`: finding severity met `--fail-on` threshold.
