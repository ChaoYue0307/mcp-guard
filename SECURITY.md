# Security Policy

## Supported Versions

`mcp-guard` is early-stage software. Security fixes target the latest npm version.

## Reporting A Vulnerability

Please do not open a public issue for a vulnerability that could expose users.

Email: [hechaoyue0307@gmail.com](mailto:hechaoyue0307@gmail.com)

Include:

- affected version;
- operating system;
- config sample with secrets removed;
- reproduction steps;
- expected and actual behavior;
- potential impact.

I will acknowledge valid reports as quickly as practical and coordinate disclosure before publishing details.

## Scope

In scope:

- secret redaction failures;
- unexpected config upload or network access;
- incorrect handling of local files;
- CLI behavior that hides high-risk findings;
- supply-chain or package publishing issues.

Out of scope:

- generic MCP server vulnerabilities unrelated to `mcp-guard`;
- findings that require already-compromised local admin access;
- social engineering against maintainers;
- spam or automated low-signal reports.

