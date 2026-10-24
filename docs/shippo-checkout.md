# Shippo checkout verification

The storefront uses Medusa's configured publishable key (`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`) and backend URL (`MEDUSA_BACKEND_URL`). The Shippo token belongs only on the backend.

The address step saves the recipient, street, apartment/suite, city, state, ZIP, country, and supplied contact information before opening delivery. US addresses require a two-letter state and a five-digit ZIP or ZIP+4.

Delivery lists options with `GET /store/shipping-options?cart_id=...` and requests every calculated option with `POST /store/shipping-options/{id}/calculate`, sending `{ "cart_id": "..." }`. The displayed amount comes from `shipping_option.calculated_price.calculated_amount` in Medusa currency units. Selection sends only `{ "option_id": "..." }` through Medusa's cart shipping-method endpoint. Medusa owns the persisted price, recalculation, taxes, and totals.

Options and quotes bypass the fetch cache. Changing the saved address, item/variant/quantity, currency, region, or promotions reloads rates. Failed or malformed quotes are disabled and show an error with a retry button. A valid numeric zero is supported; an absent quote is never treated as zero. Before selection, the cart summary says “Calculated at checkout.” Selecting a method invalidates the cart cache so the checkout summary uses the backend totals.

## Automated regression checks

Run `node --test tests/shipping.test.cjs`. These use mocked Medusa transport and server-rendered summaries, covering address persistence/validation, rate input changes, calculation payloads, uncached requests, failures/retry, zero/missing quotes, shipping selection, and displaying backend cart/order totals. They do not verify carrier prices or complete a checkout.

## End-to-end acceptance

Use configured backend test credentials, a US sales region, a publishable key linked to the sales channel, available inventory at the shipping stock location, and real variant package dimensions/weights and origin address.

1. Add an in-stock variant and save a complete US address. Include an apartment or suite to confirm it survives saving and re-editing.
2. Test valid destinations such as New York (NY 10001), San Francisco (CA 94103), and Austin (TX 78701), using an actual deliverable street address for each. Repeat with quantities 1 and 2. Confirm a fresh option-list request and calculation for each option after every change. Record failures as failures; equal prices across destinations are possible.
3. Compare each quote with Shippo using the same origin, full destination, carrier/service, package dimensions/weights, package count, and credentials. The storefront receives Medusa's price; direct Shippo comparison requires backend access.
4. Interrupt the carrier/backend request. Confirm unavailable options display an error, cannot be selected, and can be retried. Confirm Continue stays disabled when the selected option has no valid quote or its inventory is unavailable.
5. Select a quoted option. Confirm the cart response's shipping method amount and shipping subtotal/total agree with the selected price, accounting for taxes/discounts. Confirm the overall cart total includes shipping. Change quantity and confirm Medusa recalculates the selected method and the UI refreshes.
6. Complete a checkout with a test payment provider and verify the resulting order's shipping method, shipping total, tax, and total. Check both the confirmation and account order summary. Do not use a real payment method for this test.
7. Only after a successful test checkout, replace the backend Shippo test token with the live token and restart the backend. Request and verify a fresh quote with actual credentials and configured inventory/package data before calling live quotes verified.

A successful mock test or storefront build does not verify a live Shippo quote. Backend secrets are neither configured nor changed by this storefront integration.

## Configured backend check — October 24, 2026

The backend health endpoint, region listing, and product listing responded successfully. An isolated cart (`cart_01M5PN3Q8CRBJDZ7JTCN4E9QS5`) was created in the USD/US region using the USD-priced Allen Bradley variant (`variant_01KNAJFCAQV99CHPD3Y3K9BJNR`). Complete US addresses were saved, and quantities were updated through the Store API.

| Destination ZIP | Quantity 1 | Quantity 2 |
| --- | --- | --- |
| 10001 (New York) | No shipping options returned | No shipping options returned |
| 94103 (San Francisco) | No shipping options returned | No shipping options returned |
| 78701 (Austin) | No shipping options returned | No shipping options returned |

All six shipping-option list responses contained an empty array. Backend option eligibility/configuration for this cart must be resolved before carrier calculations, shipping selection, actual cart/order totals, or checkout can be verified. No payment or order was submitted, and no Shippo credentials were changed. No direct Shippo price comparison or live-quote verification was possible. The automated summary tests use fixtures, not actual completed orders.

Repository-wide `tsc --noEmit` currently fails in existing line-item price/unit-price and home product-tag components. `npm run lint` crashes in the existing Next.js ESLint rules. A separate React hooks check can run using the bundled TypeScript parser; these tooling failures are separate from carrier verification.

### Follow-up: USA Shipping is listed but calculation fails

The checkout on port 8000 was running from `/Users/user/Codes/stalux-store-storefront`, a different checkout from this workspace. Its original shipping files matched this workspace's pre-change versions. The integration changes were applied there, preserving its environment configuration; Chrome then displayed the updated unavailable-rate error and retry button. All nine regression tests passed from that running checkout.

A subsequent backend check listed `USA Shipping` (`so_01M5PPV24KR1RT6T4761ZEF6VC`) with provider `shippo_default`, `price_type: calculated`, and `insufficient_inventory: false`. Calculating this option for the isolated cart above returned HTTP 500:

```json
{"code":"unknown_error","type":"unknown_error","message":"An unknown error occurred."}
```

The remaining failure is at the backend calculation boundary. Backend provider logs are required to determine its cause; the Store API response does not identify it. No valid shipping quote, actual shipping selection, order checkout, or live credentials have been verified. The UI keeps this option disabled and exposes retry instead of substituting a zero price.
