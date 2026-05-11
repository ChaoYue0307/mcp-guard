#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const liveMode = process.argv.includes("--live");

const expectedProducts = [
  {
    key: "starter-kit",
    marker: "REPLACE_WITH_STARTER_PAYMENT_LINK",
    buttonText: "Buy starter kit"
  },
  {
    key: "pro-monthly",
    marker: "REPLACE_WITH_PRO_PAYMENT_LINK",
    buttonText: "Start Pro"
  },
  {
    key: "team-setup",
    marker: "REPLACE_WITH_TEAM_SETUP_PAYMENT_LINK",
    buttonText: "Buy setup package"
  }
];

const errors = [];
const warnings = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);

  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    errors.push(`Missing or unreadable ${relativePath}: ${error.message}`);
    return "";
  }
}

function isLiveStripePaymentLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com" && url.pathname.length > 1;
  } catch {
    return false;
  }
}

function configuredCheckoutLink(source, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`["']${escapedKey}["']\\s*:\\s*["']([^"']+)["']`);
  return source.match(pattern)?.[1] || "";
}

const indexHtml = read("site/index.html");
const checkoutJs = read("site/checkout.js");
const thanksHtml = read("site/thanks/index.html");
const legalHtml = read("site/legal/index.html");
const intakeHtml = read("site/intake/index.html");
const paymentsDoc = read("docs/self-serve-payments.md");
const starterKitReadme = read("docs/starter-kit/README.md");
const starterKitPolicy = read("docs/starter-kit/policy-template.json");

if (!indexHtml.includes('<script src="checkout.js" defer></script>')) {
  errors.push("site/index.html must load site/checkout.js.");
}

if (!checkoutJs.includes("function isLiveStripePaymentLink")) {
  errors.push("site/checkout.js must validate live Stripe Payment Links before replacing button hrefs.");
}

for (const product of expectedProducts) {
  if (!indexHtml.includes(`data-stripe-product="${product.key}"`)) {
    errors.push(`site/index.html is missing data-stripe-product="${product.key}".`);
  }

  if (!indexHtml.includes(product.buttonText)) {
    errors.push(`site/index.html is missing checkout button text: ${product.buttonText}.`);
  }

  const configuredLink = configuredCheckoutLink(checkoutJs, product.key);

  if (!configuredLink) {
    errors.push(`site/checkout.js is missing checkout config for ${product.key}.`);
    continue;
  }

  if (configuredLink === product.marker) {
    warnings.push(`${product.key} still uses ${product.marker}.`);
  } else if (!isLiveStripePaymentLink(configuredLink)) {
    errors.push(`${product.key} must be ${product.marker} or a live https://buy.stripe.com/... link.`);
  }

  if (liveMode && !isLiveStripePaymentLink(configuredLink)) {
    errors.push(`${product.key} is not ready for live checkout.`);
  }
}

const requiredSiteContent = [
  [thanksHtml, "site/thanks/index.html", "Payment received."],
  [thanksHtml, "site/thanks/index.html", "Delivery checklist"],
  [legalHtml, "site/legal/index.html", "Terms"],
  [legalHtml, "site/legal/index.html", "Refunds"],
  [legalHtml, "site/legal/index.html", "Privacy"],
  [legalHtml, "site/legal/index.html", "Stripe-hosted checkout"],
  [intakeHtml, "site/intake/index.html", "Setup intake"],
  [intakeHtml, "site/intake/index.html", "Do not send secrets"],
  [intakeHtml, "site/intake/index.html", "Redacted MCP config"],
  [intakeHtml, "site/intake/index.html", "Email setup intake"],
  [thanksHtml, "site/thanks/index.html", "../intake/"],
  [indexHtml, "site/index.html", "Terms, privacy, and refunds"]
];

for (const [source, file, expected] of requiredSiteContent) {
  if (!source.includes(expected)) {
    errors.push(`${file} is missing expected content: ${expected}`);
  }
}

const requiredDocContent = [
  "site/checkout.js",
  "docs/starter-kit/",
  "npm run payments:check -- --live",
  "https://chaoyue0307.github.io/mcp-guard/thanks/",
  "https://chaoyue0307.github.io/mcp-guard/legal/",
  "https://chaoyue0307.github.io/mcp-guard/intake/",
  "https://buy.stripe.com/"
];

for (const expected of requiredDocContent) {
  if (!paymentsDoc.includes(expected)) {
    errors.push(`docs/self-serve-payments.md is missing expected content: ${expected}`);
  }
}

const requiredStarterKitFiles = [
  "docs/starter-kit/README.md",
  "docs/starter-kit/policy-template.json",
  "docs/starter-kit/baseline-review-template.md",
  "docs/starter-kit/github-action-setup-checklist.md",
  "docs/starter-kit/audit-handoff-template.md",
  "docs/starter-kit/private-repo-rollout-guide.md"
];

for (const relativePath of requiredStarterKitFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Starter kit deliverable is missing: ${relativePath}`);
  }
}

const requiredStarterKitContent = [
  [starterKitReadme, "docs/starter-kit/README.md", "policy-template.json"],
  [starterKitReadme, "docs/starter-kit/README.md", "github-action-setup-checklist.md"],
  [starterKitReadme, "docs/starter-kit/README.md", "audit-handoff-template.md"],
  [starterKitReadme, "docs/starter-kit/README.md", "private-repo-rollout-guide.md"],
  [starterKitPolicy, "docs/starter-kit/policy-template.json", "allowedCommands"],
  [starterKitPolicy, "docs/starter-kit/policy-template.json", "allowedDirectories"]
];

for (const [source, file, expected] of requiredStarterKitContent) {
  if (!source.includes(expected)) {
    errors.push(`${file} is missing expected starter kit content: ${expected}`);
  }
}

if (warnings.length > 0) {
  process.stdout.write("payment readiness warnings:\n");
  for (const warning of warnings) {
    process.stdout.write(`- ${warning}\n`);
  }
}

if (errors.length > 0) {
  process.stderr.write("payment readiness check failed:\n");
  for (const error of errors) {
    process.stderr.write(`- ${error}\n`);
  }
  process.exit(1);
}

process.stdout.write(`payment readiness check passed (${liveMode ? "live" : "draft"} mode)\n`);
