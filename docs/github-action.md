# GitHub Action

Use the `mcp-guard` action to scan MCP and AI agent tool configuration in pull requests and CI.

The action installs the published npm package, generates Markdown, HTML, and JSON reports, uploads them as a workflow artifact, then fails the job when findings meet your selected severity threshold.

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
      - uses: ChaoYue0307/mcp-guard@v0.2.0
        with:
          fail-on: high
```

## Scan a Specific Config

```yaml
- uses: ChaoYue0307/mcp-guard@v0.2.0
  with:
    config: .mcp.json
    fail-on: medium
```

## Pin the npm Package

The action defaults to `agent-mcp-guard@latest`. Pin it when you want deterministic CI behavior:

```yaml
- uses: ChaoYue0307/mcp-guard@v0.2.0
  with:
    package-version: 0.2.0
    fail-on: high
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `config` | empty | Optional MCP config path. Empty scans default project and user config locations. |
| `fail-on` | `high` | Fails the job for `critical`, `high`, `medium`, or `low` findings. Use `none` for report-only mode. |
| `output-dir` | `mcp-guard-report` | Directory for generated reports. |
| `package-version` | `latest` | npm package version to install. |
| `upload-artifact` | `true` | Uploads generated reports as a workflow artifact. |
| `artifact-name` | `mcp-guard-report` | Name of the uploaded artifact. |

## Outputs

| Output | Description |
| --- | --- |
| `markdown-report` | Path to the generated Markdown report. |
| `html-report` | Path to the generated HTML report. |
| `json-report` | Path to the generated JSON report. |
| `exit-code` | `0` when below threshold, `2` when findings met the threshold. |
