# Self-Serve Payments

This is the first self-serve monetization path for `mcp-guard`.

The short-term goal is not a full SaaS dashboard. The short-term goal is a checkout path where a buyer can pay without a sales call, receive a clear deliverable, and later upgrade into a recurring product.

## Starter Kit Deliverables

The Starter Kit files live in:

```text
docs/starter-kit/
```

They include:

- `policy-template.json`;
- `baseline-review-template.md`;
- `github-action-setup-checklist.md`;
- `audit-handoff-template.md`;
- `private-repo-rollout-guide.md`.

## Recommended Stripe Setup

Start with Stripe Payment Links because they are the fastest hosted checkout path for one-time products and subscriptions.

Create these products in Stripe:

| Product | Price | Billing | Delivery |
| --- | ---: | --- | --- |
| MCP Audit Starter Kit | USD 49 | One-time | Templates, setup checklist, audit handoff template, rollout guide. |
| mcp-guard Pro | USD 19 | Monthly subscription | Private repo license workflow, policy template updates, priority examples. |
| Team Setup Package | USD 199 | One-time | One repo setup package with Action, baseline, SARIF, PR comments, and audit closeout. |

Use Stripe Checkout or Payment Links with Stripe Tax enabled when you are ready to collect tax automatically.

## Website Integration

The GitHub Pages site already has a pricing section in `site/index.html`.

Checkout URLs are configured in one place:

```text
site/checkout.js
```

After creating live Stripe Payment Links, replace these values:

| Product | Checkout marker | Replace with |
| --- | --- | --- |
| Starter kit | `REPLACE_WITH_STARTER_PAYMENT_LINK` | Starter kit Payment Link |
| Pro monthly | `REPLACE_WITH_PRO_PAYMENT_LINK` | Pro subscription Payment Link |
| Team setup | `REPLACE_WITH_TEAM_SETUP_PAYMENT_LINK` | Team setup Payment Link |

The website buttons keep a `mailto:` fallback in the static HTML. When `site/checkout.js` contains a live Stripe URL, the page automatically points the button to Stripe checkout.

Use links that start with:

```text
https://buy.stripe.com/
```

Set each Payment Link's post-payment redirect URL to:

```text
https://chaoyue0307.github.io/mcp-guard/thanks/
```

Use this page for checkout policy links:

```text
https://chaoyue0307.github.io/mcp-guard/legal/
```

Use this page for Team Setup onboarding after payment:

```text
https://chaoyue0307.github.io/mcp-guard/intake/
```

Before going live, run:

```sh
npm run payments:check -- --live
```

Without `--live`, the same check verifies that the draft checkout wiring, fallback links, success page, and policy page are present while placeholders are still expected.

Do not commit secret keys, restricted keys, webhook signing secrets, or customer data to the repo.

## Fulfillment Path

Use this sequence before building a backend:

1. Customer pays through Stripe Payment Link.
2. Stripe sends a successful payment receipt.
3. The confirmation page or receipt links to a private download or onboarding page.
4. For Pro, manually issue a first license key until automated webhooks are implemented.
5. For Team Setup, direct the buyer to `https://chaoyue0307.github.io/mcp-guard/intake/`.
6. Track buyers in Stripe Dashboard and a private operations sheet.

When manual license creation becomes painful, add:

- Stripe webhook for `checkout.session.completed`;
- signed license key generation;
- a private license verification endpoint;
- Stripe Customer Portal for subscription management.

An implementation starter is available in:

```text
examples/stripe-fulfillment-worker/
```

It verifies Stripe webhook signatures, reads `mcp_guard_product` metadata, creates deterministic Pro license keys, and can send fulfillment email through Resend. Keep it separate from the static GitHub Pages site because webhook secrets and signing secrets must live only in a backend or worker runtime.

Set this metadata on each Payment Link before using the worker:

| Product | Metadata key | Metadata value |
| --- | --- | --- |
| Starter kit | `mcp_guard_product` | `starter-kit` |
| Pro monthly | `mcp_guard_product` | `pro-monthly` |
| Team setup | `mcp_guard_product` | `team-setup` |

## Product Boundary

Keep the open-source project useful:

- CLI scan remains free.
- GitHub Action remains free for open-source and trial use.
- Reports remain local-first and redacted.

Paid plans should sell convenience and team workflow:

- private repo license workflow;
- maintained policy templates;
- audit pack templates;
- setup package;
- multi-repo history later;
- hosted dashboard later.

## Launch Checklist

- Stripe account verified.
- Products and prices created.
- Payment Links created for all three offers.
- Confirmation page configured.
- Success redirect points to `https://chaoyue0307.github.io/mcp-guard/thanks/`.
- Customer support email set to `hechaoyue0307@gmail.com`.
- Refund policy written.
- Basic terms and privacy page linked from checkout or website.
- Test payment completed in Stripe test mode.
- Live Payment Links pasted into `site/checkout.js`.
- `npm run payments:check -- --live` passes.
- GitHub Pages deployment verified.
