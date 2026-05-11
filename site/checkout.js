const CHECKOUT_LINKS = Object.freeze({
  "starter-kit": "REPLACE_WITH_STARTER_PAYMENT_LINK",
  "pro-monthly": "REPLACE_WITH_PRO_PAYMENT_LINK",
  "team-setup": "REPLACE_WITH_TEAM_SETUP_PAYMENT_LINK"
});

function isLiveStripePaymentLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com" && url.pathname.length > 1;
  } catch {
    return false;
  }
}

function applyCheckoutLinks() {
  document.querySelectorAll("[data-stripe-product]").forEach((link) => {
    const product = link.getAttribute("data-stripe-product");
    const checkoutUrl = CHECKOUT_LINKS[product];

    if (isLiveStripePaymentLink(checkoutUrl)) {
      link.setAttribute("href", checkoutUrl);
      link.setAttribute("data-stripe-link", checkoutUrl);
      link.setAttribute("data-checkout-status", "live");
      return;
    }

    link.setAttribute("data-checkout-status", "setup-required");
  });
}

applyCheckoutLinks();
