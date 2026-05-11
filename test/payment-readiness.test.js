import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function runPaymentCheck(args = []) {
  return spawnSync(process.execPath, ["scripts/check-payments-ready.js", ...args], {
    cwd: root,
    encoding: "utf8"
  });
}

function checkoutSourceWithLiveLinks(source) {
  return source
    .replace("REPLACE_WITH_STARTER_PAYMENT_LINK", "https://buy.stripe.com/starter123")
    .replace("REPLACE_WITH_PRO_PAYMENT_LINK", "https://buy.stripe.com/pro123")
    .replace("REPLACE_WITH_TEAM_SETUP_PAYMENT_LINK", "https://buy.stripe.com/team123");
}

function createLink(product) {
  const attributes = new Map([["data-stripe-product", product]]);

  return {
    getAttribute(name) {
      return attributes.get(name) || null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    snapshot() {
      return Object.fromEntries(attributes.entries());
    }
  };
}

function executeCheckoutScript(source, links) {
  const document = {
    querySelectorAll(selector) {
      assert.equal(selector, "[data-stripe-product]");
      return links;
    }
  };

  vm.runInNewContext(source, { URL, document });
}

test("payment readiness check passes in draft mode", () => {
  const result = runPaymentCheck();

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /payment readiness check passed \(draft mode\)/);
});

test("payment readiness live mode reflects checkout link state", () => {
  const checkoutSource = fs.readFileSync(path.join(root, "site", "checkout.js"), "utf8");
  const result = runPaymentCheck(["--live"]);

  if (checkoutSource.includes("REPLACE_WITH_")) {
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not ready for live checkout/);
    return;
  }

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /payment readiness check passed \(live mode\)/);
});

test("checkout script keeps placeholders on mail fallback", () => {
  const source = fs.readFileSync(path.join(root, "site", "checkout.js"), "utf8");
  const links = [createLink("starter-kit"), createLink("pro-monthly"), createLink("team-setup")];

  executeCheckoutScript(source, links);

  assert.deepEqual(links.map((link) => link.snapshot()), [
    { "data-stripe-product": "starter-kit", "data-checkout-status": "setup-required" },
    { "data-stripe-product": "pro-monthly", "data-checkout-status": "setup-required" },
    { "data-stripe-product": "team-setup", "data-checkout-status": "setup-required" }
  ]);
});

test("checkout script swaps live Stripe links into pricing buttons", () => {
  const source = checkoutSourceWithLiveLinks(fs.readFileSync(path.join(root, "site", "checkout.js"), "utf8"));
  const links = [createLink("starter-kit"), createLink("pro-monthly"), createLink("team-setup")];

  executeCheckoutScript(source, links);

  assert.deepEqual(links.map((link) => link.snapshot()), [
    {
      "data-stripe-product": "starter-kit",
      href: "https://buy.stripe.com/starter123",
      "data-stripe-link": "https://buy.stripe.com/starter123",
      "data-checkout-status": "live"
    },
    {
      "data-stripe-product": "pro-monthly",
      href: "https://buy.stripe.com/pro123",
      "data-stripe-link": "https://buy.stripe.com/pro123",
      "data-checkout-status": "live"
    },
    {
      "data-stripe-product": "team-setup",
      href: "https://buy.stripe.com/team123",
      "data-stripe-link": "https://buy.stripe.com/team123",
      "data-checkout-status": "live"
    }
  ]);
});
