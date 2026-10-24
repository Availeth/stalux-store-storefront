# PayPal checkout

Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in `.env.local` and in the storefront deployment
environment to the public Client ID of the same PayPal app used by the Medusa
backend. Restart the dev server or rebuild the deployment after setting it.
The PayPal Client Secret belongs only on the backend.

The region must enable a PayPal provider (`pp_paypal_default` or
`pp_paypal_paypal`). Payment session initialization must create a PayPal order
and return its ID in `data.order_id`, `data.orderId`, or `data.id`.
The storefront reads the intent from `data.intent` or `data.order.intent` (the
format returned by our backend provider). `AUTHORIZE` selects authorization;
otherwise it defaults to capture, matching our backend's `CAPTURE` orders.
The SDK intent must match the backend's order or PayPal will close the popup.

At Review, the official PayPal SDK opens approval for that existing order.
After approval the storefront calls Medusa's cart completion action. The backend
must verify the order with PayPal and authorize/capture it as appropriate; the
browser does not mark the payment as paid. Successful completion uses the
existing order-confirmation redirect. A completion failure offers a retry without
asking the buyer to approve a second PayPal order.

Sandbox verification:

1. Use a sandbox Client ID matching the backend's sandbox app.
2. Add a product, enter addresses, and select delivery and PayPal.
3. Continue to Review, click PayPal, and cancel. The cart should remain open.
4. Click PayPal again and approve with a sandbox buyer account.
5. Confirm the order-confirmation page appears and the Medusa order has the
   expected payment status. Also test a declined payment and a completion failure.

Reference: https://docs.medusajs.com/resources/integrations/guides/paypal
