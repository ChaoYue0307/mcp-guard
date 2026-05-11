const PRODUCTS = Object.freeze({
  "starter-kit": {
    name: "MCP Audit Starter Kit",
    subject: "Your mcp-guard starter kit"
  },
  "pro-monthly": {
    name: "mcp-guard Pro",
    subject: "Your mcp-guard Pro license"
  },
  "team-setup": {
    name: "mcp-guard Team Setup Package",
    subject: "Your mcp-guard setup package next steps"
  }
});

const DEFAULT_SUPPORT_EMAIL = "hechaoyue0307@gmail.com";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function parseStripeSignature(header) {
  const entries = String(header || "")
    .split(",")
    .map((part) => part.trim().split("="))
    .filter((part) => part.length === 2);

  const timestamp = entries.find(([key]) => key === "t")?.[1] || "";
  const signatures = entries.filter(([key]) => key === "v1").map(([, value]) => value);

  return { timestamp, signatures };
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

async function hmacHex(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(message) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyStripeSignature(rawBody, signatureHeader, webhookSecret, options = {}) {
  if (!webhookSecret) {
    return false;
  }

  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const toleranceSeconds = options.toleranceSeconds ?? 300;
  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const timestampNumber = Number(timestamp);

  if (!timestamp || !Number.isFinite(timestampNumber) || signatures.length === 0) {
    return false;
  }

  if (Math.abs(nowSeconds - timestampNumber) > toleranceSeconds) {
    return false;
  }

  const expected = await hmacHex(webhookSecret, `${timestamp}.${rawBody}`);
  return signatures.some((actual) => timingSafeEqual(actual, expected));
}

export async function createLicenseKey({ product, sessionId, email, secret }) {
  const payload = [product, sessionId, email || "unknown"].join(":");
  const signature = await hmacHex(secret, payload);
  return `MCPG-${product.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${signature.slice(0, 24).toUpperCase()}`;
}

async function licenseStorageKey(licenseKey) {
  return `license:${await sha256Hex(licenseKey)}`;
}

function subscriptionStorageKey(subscriptionId) {
  return `subscription:${subscriptionId}`;
}

function stripeId(value) {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value.id || "";
}

function productFromSession(session) {
  return session?.metadata?.mcp_guard_product || session?.metadata?.product || "";
}

function buyerEmailFromSession(session) {
  return session?.customer_details?.email || session?.customer_email || "";
}

export async function buildFulfillment(session, env = {}) {
  const product = productFromSession(session);
  const productConfig = PRODUCTS[product];
  const email = buyerEmailFromSession(session);
  const supportEmail = env.SUPPORT_EMAIL || DEFAULT_SUPPORT_EMAIL;

  if (!productConfig) {
    return {
      ok: false,
      status: 422,
      body: {
        error: "unknown_product",
        product
      }
    };
  }

  if (!email) {
    return {
      ok: false,
      status: 422,
      body: {
        error: "missing_customer_email",
        product
      }
    };
  }

  if (product === "pro-monthly" && !env.LICENSE_SIGNING_SECRET) {
    return {
      ok: false,
      status: 500,
      body: {
        error: "missing_license_signing_secret",
        product
      }
    };
  }

  const licenseKey = product === "pro-monthly"
    ? await createLicenseKey({
        product,
        sessionId: session.id,
        email,
        secret: env.LICENSE_SIGNING_SECRET
      })
    : "";

  return {
    ok: true,
    status: 200,
    licenseKey,
    body: {
      received: true,
      product,
      email,
      deliveryMode: env.RESEND_API_KEY ? "email" : "manual_email_required"
    },
    email: {
      to: email,
      subject: productConfig.subject,
      html: renderFulfillmentEmail({
        product,
        productName: productConfig.name,
        email,
        licenseKey,
        supportEmail
      })
    }
  };
}

export function renderFulfillmentEmail({ product, productName, licenseKey, supportEmail }) {
  const licenseBlock = licenseKey
    ? `<p><strong>License key:</strong> <code>${licenseKey}</code></p>`
    : "";
  const nextStep = product === "team-setup"
    ? "Reply with the repository URL and redacted MCP config context for the setup package."
    : "Start with the GitHub repository, policy templates, and E2E example linked below.";

  return `<!doctype html>
<html>
  <body>
    <h1>${productName}</h1>
    <p>Thanks for purchasing mcp-guard.</p>
    ${licenseBlock}
    <p>${nextStep}</p>
    <ul>
      <li><a href="https://github.com/ChaoYue0307/mcp-guard">mcp-guard GitHub repository</a></li>
      <li><a href="https://chaoyue0307.github.io/mcp-guard/e2e/">Transparent E2E example</a></li>
      <li><a href="https://chaoyue0307.github.io/mcp-guard/legal/">Terms, privacy, and refunds</a></li>
    </ul>
    <p>Do not send secrets, tokens, or raw private MCP config values by email. Use redacted snippets only.</p>
    <p>Support: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
  </body>
</html>`;
}

async function storeLicenseRecord({ licenseKey, session, product, email, env }) {
  if (!licenseKey || !env.LICENSES?.put) {
    return { stored: false, reason: "missing_license_store" };
  }

  const licenseKeyStorage = await licenseStorageKey(licenseKey);
  const subscriptionId = stripeId(session.subscription);
  const record = {
    status: "active",
    product,
    email: email.toLowerCase(),
    stripeSessionId: session.id,
    stripeCustomerId: stripeId(session.customer),
    stripeSubscriptionId: subscriptionId,
    stripeSubscriptionStatus: "active",
    createdAt: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
    updatedAt: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString()
  };

  await env.LICENSES.put(licenseKeyStorage, JSON.stringify(record));

  if (subscriptionId) {
    await env.LICENSES.put(subscriptionStorageKey(subscriptionId), JSON.stringify({
      licenseKeyStorage,
      product,
      email: email.toLowerCase()
    }));
  }

  return { stored: true };
}

async function readLicenseRecord(storageKey, env) {
  const stored = await env.LICENSES.get(storageKey);
  if (!stored) {
    return {
      ok: false,
      error: "license_not_found"
    };
  }

  try {
    return {
      ok: true,
      record: JSON.parse(stored)
    };
  } catch {
    return {
      ok: false,
      error: "invalid_license_record"
    };
  }
}

async function updateLicenseForSubscription({ subscriptionId, status, stripeSubscriptionStatus, reason, eventCreated, env }) {
  if (!subscriptionId) {
    return { updated: false, reason: "missing_subscription_id" };
  }

  if (!env.LICENSES?.get || !env.LICENSES?.put) {
    return { updated: false, reason: "missing_license_store" };
  }

  const indexRaw = await env.LICENSES.get(subscriptionStorageKey(subscriptionId));
  if (!indexRaw) {
    return { updated: false, reason: "license_not_found" };
  }

  let index;
  try {
    index = JSON.parse(indexRaw);
  } catch {
    return { updated: false, reason: "invalid_subscription_index" };
  }

  if (!index.licenseKeyStorage) {
    return { updated: false, reason: "invalid_subscription_index" };
  }

  const existing = await readLicenseRecord(index.licenseKeyStorage, env);
  if (!existing.ok) {
    return { updated: false, reason: existing.error };
  }

  const updated = {
    ...existing.record,
    status,
    stripeSubscriptionStatus,
    statusReason: reason,
    updatedAt: eventCreated ? new Date(eventCreated * 1000).toISOString() : new Date().toISOString()
  };

  await env.LICENSES.put(index.licenseKeyStorage, JSON.stringify(updated));

  return {
    updated: true,
    status,
    stripeSubscriptionStatus,
    email: updated.email,
    product: updated.product,
    stripeSubscriptionId: subscriptionId
  };
}

export async function verifyLicense({ licenseKey, email, product = "pro-monthly" }, env = {}) {
  if (!licenseKey || !email) {
    return {
      valid: false,
      error: "missing_license_or_email"
    };
  }

  if (!env.LICENSES?.get) {
    return {
      valid: false,
      error: "missing_license_store"
    };
  }

  const existing = await readLicenseRecord(await licenseStorageKey(licenseKey), env);
  if (!existing.ok) {
    return {
      valid: false,
      error: existing.error
    };
  }

  const { record } = existing;

  if (record.status === "past_due") {
    return {
      valid: false,
      error: "license_past_due"
    };
  }

  if (record.status !== "active") {
    return {
      valid: false,
      error: "license_inactive"
    };
  }

  if (record.email !== email.toLowerCase() || record.product !== product) {
    return {
      valid: false,
      error: "license_mismatch"
    };
  }

  return {
    valid: true,
    product: record.product,
    email: record.email,
    stripeSessionId: record.stripeSessionId,
    stripeSubscriptionId: record.stripeSubscriptionId || ""
  };
}

export async function handleLicenseVerify(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const result = await verifyLicense({
    licenseKey: body.licenseKey,
    email: body.email,
    product: body.product || "pro-monthly"
  }, env);

  return jsonResponse(result, result.valid || result.error !== "missing_license_store" ? 200 : 503);
}

async function sendFulfillmentEmail(email, env) {
  if (!env.RESEND_API_KEY || !env.FULFILLMENT_FROM) {
    return { sent: false, reason: "missing_email_provider" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.FULFILLMENT_FROM,
      to: email.to,
      subject: email.subject,
      html: email.html
    })
  });

  if (!response.ok) {
    return {
      sent: false,
      reason: "email_provider_failed",
      status: response.status,
      body: await response.text()
    };
  }

  return { sent: true };
}

export async function handleStripeEvent(event, env) {
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data?.object || {};
    const subscriptionId = stripeId(subscription);
    const license = await updateLicenseForSubscription({
      subscriptionId,
      status: "inactive",
      stripeSubscriptionStatus: subscription.status || "canceled",
      reason: "subscription_deleted",
      eventCreated: event.created,
      env
    });

    return jsonResponse({ received: true, license });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data?.object || {};
    const subscriptionId = stripeId(invoice.subscription);
    const license = await updateLicenseForSubscription({
      subscriptionId,
      status: "past_due",
      stripeSubscriptionStatus: "past_due",
      reason: "invoice_payment_failed",
      eventCreated: event.created,
      env
    });

    return jsonResponse({ received: true, license });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data?.object || {};
    const subscriptionId = stripeId(invoice.subscription);
    const license = await updateLicenseForSubscription({
      subscriptionId,
      status: "active",
      stripeSubscriptionStatus: "active",
      reason: "invoice_payment_succeeded",
      eventCreated: event.created,
      env
    });

    return jsonResponse({ received: true, license });
  }

  if (event.type !== "checkout.session.completed") {
    return jsonResponse({ received: true, ignored: event.type });
  }

  const fulfillment = await buildFulfillment(event.data?.object, env);

  if (!fulfillment.ok) {
    return jsonResponse(fulfillment.body, fulfillment.status);
  }

  const license = fulfillment.licenseKey
    ? await storeLicenseRecord({
        licenseKey: fulfillment.licenseKey,
        session: event.data?.object,
        product: fulfillment.body.product,
        email: fulfillment.body.email,
        env
      })
    : { stored: false, reason: "not_license_product" };
  const emailResult = await sendFulfillmentEmail(fulfillment.email, env);
  return jsonResponse({
    ...fulfillment.body,
    license,
    email: emailResult
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/license/verify") {
      return handleLicenseVerify(request, env);
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    const rawBody = await request.text();
    const signatureHeader = request.headers.get("stripe-signature");
    const verified = await verifyStripeSignature(rawBody, signatureHeader, env.STRIPE_WEBHOOK_SECRET);

    if (!verified) {
      return jsonResponse({ error: "invalid_signature" }, 400);
    }

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "invalid_json" }, 400);
    }

    return handleStripeEvent(event, env);
  }
};
