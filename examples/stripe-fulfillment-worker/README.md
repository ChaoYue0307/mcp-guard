# Stripe Fulfillment Worker Example

This is an optional backend starter for turning Stripe Payment Links into automated delivery.

Use it after the first paid purchases prove that self-serve checkout is worth automating. The GitHub Pages site can collect payment with Stripe Payment Links, but it cannot securely verify payment or issue private license keys by itself because it is static.

## What It Handles

- Verifies Stripe webhook signatures before trusting an event.
- Handles `checkout.session.completed`.
- Reads the purchased product from Checkout Session metadata.
- Generates deterministic license keys for Pro purchases.
- Sends a fulfillment email through Resend when email credentials are configured.
- Falls back to a manual fulfillment response when email sending is not configured.

## Stripe Payment Link Metadata

Add one metadata key to each Stripe Payment Link:

| Product | Metadata key | Metadata value |
| --- | --- | --- |
| Starter kit | `mcp_guard_product` | `starter-kit` |
| Pro monthly | `mcp_guard_product` | `pro-monthly` |
| Team setup | `mcp_guard_product` | `team-setup` |

## Required Secrets

Configure these as platform secrets, not committed files:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
LICENSE_SIGNING_SECRET=long-random-secret
```

For automatic email delivery, also configure:

```text
RESEND_API_KEY=re_...
FULFILLMENT_FROM=mcp-guard <delivery@example.com>
SUPPORT_EMAIL=hechaoyue0307@gmail.com
```

Without Resend credentials, the worker still verifies and classifies the purchase but returns `manual_email_required`.

## Deploy Shape

1. Deploy `worker.js` as a Cloudflare Worker or adapt the same functions to Vercel/Netlify.
2. Add a Stripe webhook endpoint for the worker URL.
3. Subscribe to `checkout.session.completed`.
4. Configure live Payment Links with the metadata above.
5. Send a Stripe test event and confirm the worker returns `{"received":true}`.

Do not put `STRIPE_WEBHOOK_SECRET`, `LICENSE_SIGNING_SECRET`, Resend keys, raw customer data, or Stripe event payloads into this repository.
