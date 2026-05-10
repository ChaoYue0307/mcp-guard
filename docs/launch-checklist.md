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
- [ ] Post a short technical article or launch note.
- [ ] Contact 20 early users for free scans or paid hardening.
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

Exit codes:

- `0`: scan completed and did not hit the fail threshold.
- `1`: CLI usage or runtime error.
- `2`: finding severity met `--fail-on` threshold.
