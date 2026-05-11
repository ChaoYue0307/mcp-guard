# Stripe Fulfillment Worker Example

This is an optional backend starter for turning Stripe Payment Links into automated delivery.

Use it after the first paid purchases prove that self-serve checkout is worth automating. The GitHub Pages site can collect payment with Stripe Payment Links, but it cannot securely verify payment or issue private license keys by itself because it is static.

## What It Handles

- Verifies Stripe webhook signatures before trusting an event.
- Handles `checkout.session.completed`.
- Handles `invoice.payment_failed`, `invoice.payment_succeeded`, and `customer.subscription.deleted` for Pro license status.
- Reads the purchased product from Checkout Session metadata.
- Generates deterministic license keys for Pro purchases.
- Stores Pro license records in a KV namespace when configured.
- Exposes `POST /license/verify` for private CI license checks.
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

For license verification, bind a KV namespace as:

```text
LICENSES
```

For automatic email delivery, also configure:

```text
RESEND_API_KEY=re_...
FULFILLMENT_FROM=mcp-guard <delivery@example.com>
SUPPORT_EMAIL=hechaoyue0307@gmail.com
```

Without Resend credentials, the worker still verifies and classifies the purchase but returns `manual_email_required`. Without the `LICENSES` binding, Pro fulfillment still generates the license email but license verification returns `missing_license_store`.

## License Verification

Pro buyers can verify a license from private CI without exposing Stripe secrets:

```sh
curl -X POST https://YOUR_WORKER_URL/license/verify \
  -H "content-type: application/json" \
  -d '{"licenseKey":"MCPG-PRO-MONTHLY-...","email":"buyer@example.com"}'
```

With the CLI:

```sh
mcp-guard license verify \
  --endpoint https://YOUR_WORKER_URL/license/verify \
  --key "$MCP_GUARD_LICENSE_KEY" \
  --email buyer@example.com
```

With the GitHub Action:

```yaml
- uses: ChaoYue0307/mcp-guard-action@v0.4.11
  with:
    license-endpoint: https://YOUR_WORKER_URL/license/verify
    license-key: ${{ secrets.MCP_GUARD_LICENSE_KEY }}
    license-email: buyer@example.com
```

Successful response:

```json
{
  "valid": true,
  "product": "pro-monthly",
  "email": "buyer@example.com",
  "stripeSessionId": "cs_...",
  "stripeSubscriptionId": "sub_..."
}
```

If a Pro invoice fails, verification returns `license_past_due`. If the subscription is deleted, verification returns `license_inactive`. A later `invoice.payment_succeeded` event can restore the license to active.

## Deploy Shape

1. Deploy `worker.js` as a Cloudflare Worker or adapt the same functions to Vercel/Netlify.
2. Create and bind the `LICENSES` KV namespace if you want Pro license verification.
3. Add a Stripe webhook endpoint for the worker URL.
4. Subscribe to `checkout.session.completed`, `invoice.payment_failed`, `invoice.payment_succeeded`, and `customer.subscription.deleted`.
5. Configure live Payment Links with the metadata above.
6. Send a Stripe test event and confirm the worker returns `{"received":true}`.
7. Verify the generated Pro license with `POST /license/verify`.

Do not put `STRIPE_WEBHOOK_SECRET`, `LICENSE_SIGNING_SECRET`, Resend keys, raw customer data, or Stripe event payloads into this repository.
