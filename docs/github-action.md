# GitHub Action

Use the `mcp-guard` action to scan MCP and AI agent tool configuration in pull requests and CI.

The action runs the CLI from the pinned GitHub Action tag, generates Markdown, HTML, JSON, and SARIF reports, writes a job summary, uploads reports as an artifact, and fails the job when findings meet your selected severity threshold.

It can also use a committed baseline to accept known findings and optionally post a pull request comment with only the active findings.

Marketplace/action repository: <https://github.com/ChaoYue0307/mcp-guard-action>

## Basic Workflow

Fastest setup:

```bash
mcp-guard init
```

That creates `.github/workflows/mcp-guard.yml` with PR comments enabled. Use `mcp-guard init --write-baseline --upload-sarif` when you want to accept current reviewed findings and send SARIF to GitHub code scanning.

```yaml
name: mcp-guard

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: ChaoYue0307/mcp-guard-action@v0.4.3
        with:
          config: .mcp.json
          fail-on: high
          comment-pr: "true"
```

## Upload SARIF to GitHub Security

Enable SARIF upload when you want findings in the repository Security tab. The workflow needs `security-events: write`.

```yaml
name: mcp-guard

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: ChaoYue0307/mcp-guard-action@v0.4.3
        with:
          config: .mcp.json
          fail-on: high
          upload-sarif: "true"
```

## Report-Only Mode

Use `fail-on: none` when you want artifacts and summaries without blocking a pull request.

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.4.3
  with:
    fail-on: none
```

## Baseline Mode

Use a baseline when you want to accept known findings and fail only on new risk.

```bash
mcp-guard scan --config .mcp.json --write-baseline .mcp-guard-baseline.json
```

Commit `.mcp-guard-baseline.json`, then reference it from the action:

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.4.3
  with:
    config: .mcp.json
    baseline: .mcp-guard-baseline.json
    fail-on: high
```

Reports will show active findings separately from findings accepted by the baseline.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `config` | empty | Optional MCP config path. Empty scans default project and user config locations. |
| `fail-on` | `high` | Fails the job for `critical`, `high`, `medium`, or `low` findings. Use `none` for report-only mode. |
| `baseline` | empty | Optional baseline/allowlist JSON path. Matching findings are accepted and do not fail the workflow. |
| `comment-pr` | `false` | Posts or updates a pull request comment with the scan summary. Requires `pull-requests: write`. |
| `output-dir` | `mcp-guard-report` | Directory for generated reports. |
| `upload-artifact` | `true` | Uploads generated reports as a workflow artifact. |
| `upload-sarif` | `false` | Uploads SARIF to GitHub code scanning. Requires `security-events: write`. |
| `artifact-name` | `mcp-guard-report` | Name of the uploaded artifact. |

## Outputs

| Output | Description |
| --- | --- |
| `markdown-report` | Path to the generated Markdown report. |
| `html-report` | Path to the generated HTML report. |
| `json-report` | Path to the generated JSON report. |
| `sarif-report` | Path to the generated SARIF report. |
| `comment-report` | Path to the generated pull request comment body. |
| `exit-code` | `0` when below threshold, `2` when findings met the threshold. |
