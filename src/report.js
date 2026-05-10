import { redactEnv } from "./redact.js";

export function generateTextReport(result) {
  const lines = [];
  lines.push("mcp-guard scan report");
  lines.push(`Generated: ${result.metadata.generatedAt}`);
  lines.push(`Scanned files: ${result.summary.scannedFileCount}`);
  lines.push(`MCP servers: ${result.summary.serverCount}`);
  lines.push(`Findings: ${result.summary.findingCount}`);
  lines.push(`Risk score: ${result.summary.riskScore}`);
  lines.push(`Critical: ${result.summary.counts.critical}  High: ${result.summary.counts.high}  Medium: ${result.summary.counts.medium}  Low: ${result.summary.counts.low}`);
  lines.push("");

  if (result.scannedFiles.length > 0) {
    lines.push("Scanned config files:");
    for (const file of result.scannedFiles) {
      lines.push(`- ${displayPath(file, result.metadata.cwd)}`);
    }
    lines.push("");
  }

  if (result.findings.length === 0) {
    lines.push("No findings.");
    return `${lines.join("\n")}\n`;
  }

  lines.push("Findings:");
  for (const finding of result.findings) {
    lines.push(`- [${finding.severity.toUpperCase()}] ${finding.id} ${finding.title}`);
    lines.push(`  Server: ${finding.serverName}`);
    lines.push(`  Evidence: ${finding.evidence}`);
    lines.push(`  Fix: ${finding.recommendation}`);
  }

  return `${lines.join("\n")}\n`;
}

export function generateMarkdownReport(result) {
  const lines = [];
  lines.push("# mcp-guard Scan Report");
  lines.push("");
  lines.push(`Generated: ${result.metadata.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Scanned files: ${result.summary.scannedFileCount}`);
  lines.push(`- MCP servers: ${result.summary.serverCount}`);
  lines.push(`- Findings: ${result.summary.findingCount}`);
  lines.push(`- Risk score: ${result.summary.riskScore}`);
  lines.push(`- Critical: ${result.summary.counts.critical}`);
  lines.push(`- High: ${result.summary.counts.high}`);
  lines.push(`- Medium: ${result.summary.counts.medium}`);
  lines.push(`- Low: ${result.summary.counts.low}`);
  lines.push("");

  lines.push("## Scanned Files");
  lines.push("");
  if (result.scannedFiles.length === 0) {
    lines.push("- None found");
  } else {
    for (const file of result.scannedFiles) {
      lines.push(`- \`${displayPath(file, result.metadata.cwd)}\``);
    }
  }
  lines.push("");

  lines.push("## MCP Server Inventory");
  lines.push("");
  if (result.servers.length === 0) {
    lines.push("- No MCP servers found.");
  } else {
    lines.push("| Server | Command | Args | CWD | URL | Env |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const server of result.servers) {
      const env = Object.entries(redactEnv(server.env)).map(([key, value]) => `${key}=${value}`).join("<br>");
      lines.push(`| ${cell(server.name)} | ${cell(server.command || "-")} | ${cell(server.args.join(" ") || "-")} | ${cell(server.cwd || "-")} | ${cell(server.url || "-")} | ${cell(env || "-")} |`);
    }
  }
  lines.push("");

  lines.push("## Findings");
  lines.push("");
  if (result.findings.length === 0) {
    lines.push("No findings.");
  } else {
    lines.push("| Severity | Rule | Server | Finding | Evidence | Recommendation |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const finding of result.findings) {
      lines.push(`| ${cell(finding.severity)} | ${cell(finding.id)} | ${cell(finding.serverName)} | ${cell(finding.title)} | ${cell(finding.evidence)} | ${cell(finding.recommendation)} |`);
    }
  }
  lines.push("");

  lines.push("## Notes");
  lines.push("");
  lines.push("- This report is an assistive security review, not a guarantee that all issues were found.");
  lines.push("- Secret-like values are redacted by default.");
  lines.push("- Review each MCP server before granting access to files, shells, SaaS accounts, or production systems.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function generateJsonReport(result) {
  return JSON.stringify(sanitizeResult(result), null, 2);
}

function cell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function displayPath(filePath, cwd) {
  if (!filePath || !cwd) return filePath;
  if (filePath === cwd) return ".";
  if (filePath.startsWith(`${cwd}/`)) return filePath.slice(cwd.length + 1);
  return filePath;
}

function sanitizeResult(result) {
  return {
    metadata: result.metadata,
    scannedFiles: result.scannedFiles,
    servers: result.servers.map((server) => ({
      name: server.name,
      configPath: server.configPath,
      command: server.command,
      args: server.args,
      env: redactEnv(server.env),
      cwd: server.cwd,
      url: server.url,
      headers: redactEnv(server.headers)
    })),
    findings: result.findings,
    summary: result.summary
  };
}
