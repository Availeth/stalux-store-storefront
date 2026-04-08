const Medusa = require('@medusajs/js-sdk').default;
const sdk = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});
sdk.store.cart.create({ region_id: 'reg_abcd' }, {}, {}).catch((e) => {
  console.log('ERROR keys:', Object.keys(e));
  console.log('ERROR message:', e.message);
  console.log('ERROR name:', e.name);
  console.log('ERROR status:', e.status);
});
