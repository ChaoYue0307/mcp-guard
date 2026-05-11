import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  buildFulfillment,
  createLicenseKey,
  handleStripeEvent,
  renderFulfillmentEmail,
  verifyStripeSignature
} from "../examples/stripe-fulfillment-worker/worker.js";

function stripeSignature({ body, secret, timestamp }) {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

test("Stripe webhook signature verification accepts fresh valid signatures", async () => {
  const body = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
  const secret = "whsec_test_secret";
  const timestamp = 1778477600;
  const header = stripeSignature({ body, secret, timestamp });

  const verified = await verifyStripeSignature(body, header, secret, {
    nowSeconds: timestamp
  });

  assert.equal(verified, true);
});

test("Stripe webhook signature verification rejects stale or invalid signatures", async () => {
  const body = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
  const secret = "whsec_test_secret";
  const timestamp = 1778477600;

  assert.equal(
    await verifyStripeSignature(body, "t=1778477600,v1=bad", secret, { nowSeconds: timestamp }),
    false
  );
  assert.equal(
    await verifyStripeSignature(body, stripeSignature({ body, secret, timestamp }), secret, {
      nowSeconds: timestamp + 301
    }),
    false
  );
});

test("license keys are deterministic and scoped to product, session, and email", async () => {
  const input = {
    product: "pro-monthly",
    sessionId: "cs_test_123",
    email: "buyer@example.com",
    secret: "license-secret"
  };

  const first = await createLicenseKey(input);
  const second = await createLicenseKey(input);
  const other = await createLicenseKey({ ...input, email: "other@example.com" });

  assert.equal(first, second);
  assert.notEqual(first, other);
  assert.match(first, /^MCPG-PRO-MONTHLY-[A-F0-9]{24}$/);
});

test("fulfillment classifies products and renders Pro license email", async () => {
  const result = await buildFulfillment({
    id: "cs_test_123",
    metadata: {
      mcp_guard_product: "pro-monthly"
    },
    customer_details: {
      email: "buyer@example.com"
    }
  }, {
    LICENSE_SIGNING_SECRET: "license-secret",
    SUPPORT_EMAIL: "support@example.com"
  });

  assert.equal(result.ok, true);
  assert.equal(result.body.product, "pro-monthly");
  assert.equal(result.body.deliveryMode, "manual_email_required");
  assert.match(result.email.html, /MCPG-PRO-MONTHLY-[A-F0-9]{24}/);
  assert.match(result.email.html, /support@example\.com/);
});

test("fulfillment rejects unknown products before delivery", async () => {
  const result = await buildFulfillment({
    id: "cs_test_123",
    metadata: {
      mcp_guard_product: "unknown"
    },
    customer_details: {
      email: "buyer@example.com"
    }
  }, {
    LICENSE_SIGNING_SECRET: "license-secret"
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 422);
  assert.deepEqual(result.body, {
    error: "unknown_product",
    product: "unknown"
  });
});

test("fulfillment refuses Pro delivery without a license signing secret", async () => {
  const result = await buildFulfillment({
    id: "cs_test_123",
    metadata: {
      mcp_guard_product: "pro-monthly"
    },
    customer_details: {
      email: "buyer@example.com"
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 500);
  assert.deepEqual(result.body, {
    error: "missing_license_signing_secret",
    product: "pro-monthly"
  });
});

test("event handler ignores unrelated Stripe events", async () => {
  const response = await handleStripeEvent({ type: "customer.created" }, {});
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    received: true,
    ignored: "customer.created"
  });
});

test("fulfillment email includes safety guidance", () => {
  const html = renderFulfillmentEmail({
    product: "team-setup",
    productName: "mcp-guard Team Setup Package",
    licenseKey: "",
    supportEmail: "support@example.com"
  });

  assert.match(html, /redacted MCP config context/);
  assert.match(html, /Do not send secrets/);
  assert.match(html, /Terms, privacy, and refunds/);
});
