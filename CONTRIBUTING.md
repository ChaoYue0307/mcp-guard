# Contributing

Thanks for helping improve `mcp-guard`.

## Good First Contributions

- Add a detection rule with a minimal test.
- Add a real-world config shape with secrets removed.
- Improve remediation wording for an existing rule.
- Add support for another MCP client config path.
- Improve Markdown or JSON report output.

## Development

```bash
npm test
npm run release:check
```

## Rule Changes

Each rule should include:

- a stable rule id;
- severity;
- clear evidence;
- practical recommendation;
- test coverage in `test/`.

Avoid noisy rules that cannot explain what the user should do next.

## Security Reports

Do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

