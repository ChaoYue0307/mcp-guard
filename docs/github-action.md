# GitHub Action

Use the `mcp-guard` action to scan MCP and AI agent tool configuration in pull requests and CI.

The action runs the CLI from the pinned GitHub Action tag, generates Markdown, HTML, JSON, and SARIF reports, writes a job summary, uploads reports as an artifact, and fails the job when findings meet your selected severity threshold.

Marketplace/action repository: <https://github.com/ChaoYue0307/mcp-guard-action>

## Basic Workflow

```yaml
name: mcp-guard

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ChaoYue0307/mcp-guard-action@v0.3.0
        with:
          fail-on: high
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
      - uses: actions/checkout@v4
      - uses: ChaoYue0307/mcp-guard-action@v0.3.0
        with:
          config: .mcp.json
          fail-on: high
          upload-sarif: "true"
```

## Report-Only Mode

Use `fail-on: none` when you want artifacts and summaries without blocking a pull request.

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.3.0
  with:
    fail-on: none
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `config` | empty | Optional MCP config path. Empty scans default project and user config locations. |
| `fail-on` | `high` | Fails the job for `critical`, `high`, `medium`, or `low` findings. Use `none` for report-only mode. |
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
| `exit-code` | `0` when below threshold, `2` when findings met the threshold. |
