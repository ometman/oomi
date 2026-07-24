# Giving Payments

The giving page currently initiates Ghanaian Mobile Money payments through
Paystack's server-side Charge API. The donor authorizes the request with a PIN
on their phone; the website must never collect that PIN.

GhanaPay, bank transfer, card, and PayPal are presented as complete disabled
form previews. Each must remain disabled until its provider integration,
webhook verification, failure handling, reconciliation, and controlled live
test are complete.

## Mobile Money and Paystack

1. Complete and verify the ministry's Ghana Paystack business account.
2. Set `MOBILE_MONEY_ENABLED=true` and add `PAYSTACK_SECRET_KEY` only to the
   server environment. Never expose the secret with a `PUBLIC_` prefix.
3. Set `GIVING_SITE_URL=https://ometomeni.org` in production.
4. Configure `https://ometomeni.org/api/giving/webhook` as the webhook URL.
5. Test each supported network and verify pending, successful, failed, timed
   out, abandoned, duplicate, and delayed-webhook scenarios.
6. Reconcile the provider reference, amount, and designation before issuing a
   receipt.

## Card and international giving

Card giving will use provider-hosted checkout. Card number, expiry date, CVV,
OTP, and 3-D Secure authentication must remain on the provider interface. The
ministry form may collect only the donor name, receipt email, amount, and
designation before redirecting.

Keep `CARD_GIVING_ENABLED=false` and `INTERNATIONAL_GIVING_ENABLED=false` until
Paystack confirms eligibility and controlled test transactions pass. The
disabled form remains visible as "Coming soon."

## GhanaPay

GhanaPay remains disabled until a contracted merchant API is selected and its
requirements are confirmed. The planned flow collects the registered wallet
number, account-holder name, receipt email, amount, and designation. The
backend initiates the wallet request; PIN approval stays on the donor's device.

Do not claim the GhanaPay flow is automated or verified until its API contract,
authentication, webhooks, and failure handling have been implemented.

## Bank transfer

Finance must verify the recipient bank, account name, account number, branch,
currency, and SWIFT/BIC before publication. Backend reconciliation requires
the donor/account name, receipt email, sending bank, transfer reference,
amount, currency, transfer date, and designation.

Do not treat submission of particulars or a receipt as proof of payment.
Finance must reconcile cleared funds against the ministry account.

## PayPal

PayPal must use the server-side Orders API. Client ID, client secret, and
webhook ID remain server-only. The backend creates and captures the order and
verifies the webhook before recording success. Donor login and approval stay
on PayPal.

## Environment and security

All current and planned configuration keys are listed in `.env.example`.
Server credentials, API secrets, and webhook secrets must never use a
`PUBLIC_` prefix. Only verified recipient values intended for display may use
`PUBLIC_`.

Never log prayer requests, donor credentials, card data, wallet PINs, PayPal
credentials, or unredacted provider payloads. Do not enable a method merely
because its environment values exist; its feature flag must be explicitly
enabled after ministry, finance, privacy, and technical review.

## Production checks

- Verify HTTPS callback and webhook URLs.
- Test failed, abandoned, pending, successful, duplicate, and delayed events.
- Confirm idempotency and server-side amount/currency verification.
- Review receipts, refunds, reconciliation, accessibility, privacy, and
  incident ownership.
- Rotate any key that may have been exposed and redeploy.

References: [Paystack payment channels](https://paystack.com/docs/payments/payment-channels/),
[Paystack webhooks](https://paystack.com/docs/payments/webhooks/), and
[PayPal Orders API](https://developer.paypal.com/docs/api/orders/v2/).
