const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const { createRequire } = require("node:module")

// Exercise the storefront modules with mocked Medusa transport; no carrier or payment calls.
function load(relative, mocks = {}) {
  const filename = path.resolve(relative)
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const localRequire = createRequire(filename)
  const module = { exports: {} }
  new Function("require", "module", "exports", source)(
    (name) => (Object.hasOwn(mocks, name) ? mocks[name] : localRequire(name)),
    module,
    module.exports
  )
  return module.exports
}
const helpers = load("src/lib/util/shipping.ts")
const address = {
  first_name: "Test",
  last_name: "Customer",
  address_1: "123 Main St",
  address_2: "Apt 4",
  city: "New York",
  province: "NY",
  postal_code: "10001",
  country_code: "us",
  phone: "2125550100",
}
const cart = {
  id: "cart_test",
  shipping_address: address,
  items: [
    { id: "item_1", variant_id: "variant_1", quantity: 1, unit_price: 20 },
  ],
  currency_code: "usd",
}

test("US address requires street, recipient, city, state, country and ZIP", () => {
  assert.equal(helpers.shippingAddressError(address), null)
  for (const key of [
    "first_name",
    "last_name",
    "address_1",
    "city",
    "province",
    "postal_code",
    "country_code",
  ]) {
    assert.ok(helpers.shippingAddressError({ ...address, [key]: " " }), key)
  }
  assert.ok(helpers.shippingAddressError({ ...address, postal_code: "123" }))
  assert.ok(helpers.shippingAddressError({ ...address, province: "New York" }))
  assert.equal(
    helpers.shippingAddressError({ ...address, postal_code: "10001-1234" }),
    null
  )
})
test("quotes invalidate for ZIP, state, apartment, item, variant and quantity changes", () => {
  const initial = helpers.shippingRatesKey(cart)
  for (const change of [
    { postal_code: "94103" },
    { province: "CA" },
    { address_2: "Apt 5" },
  ]) {
    assert.notEqual(
      initial,
      helpers.shippingRatesKey({
        ...cart,
        shipping_address: { ...address, ...change },
      })
    )
  }
  for (const change of [
    { quantity: 2 },
    { variant_id: "variant_2" },
    { id: "item_2" },
  ]) {
    assert.notEqual(
      initial,
      helpers.shippingRatesKey({
        ...cart,
        items: [{ ...cart.items[0], ...change }],
      })
    )
  }
  assert.notEqual(initial, helpers.shippingRatesKey({ ...cart, items: [] }))
  assert.equal(
    initial,
    helpers.shippingRatesKey({
      ...cart,
      shipping_methods: [{ shipping_option_id: "so_test" }],
      updated_at: "later",
    })
  )
})
test("calculated rates use calculated_amount rather than amount, including zero", () => {
  assert.equal(
    helpers.shippingOptionAmount({
      price_type: "calculated",
      amount: 0,
      calculated_price: { calculated_amount: 12.34 },
    }),
    12.34
  )
  assert.equal(
    helpers.shippingOptionAmount({
      price_type: "calculated",
      amount: 99,
      calculated_price: { calculated_amount: 0 },
    }),
    0
  )
  assert.equal(
    helpers.shippingOptionAmount({ price_type: "flat", amount: 5 }),
    5
  )
})
test("missing, malformed and negative quotes are unavailable, never free", () => {
  for (const amount of [undefined, null, NaN, Infinity, -1, "5"]) {
    assert.throws(
      () =>
        helpers.shippingOptionAmount({
          price_type: "calculated",
          amount: 0,
          calculated_price: { calculated_amount: amount },
        }),
      /unavailable/
    )
  }
  assert.throws(
    () => helpers.shippingOptionAmount({ price_type: "calculated", amount: 0 }),
    /unavailable/
  )
})
test("options and calculations send cart ID without caching and propagate failures for retry", async () => {
  const calls = []
  let fail = false
  const actions = load("src/lib/data/fulfillment.ts", {
    "@lib/config": {
      sdk: {
        client: {
          fetch: async (url, init) => {
            calls.push({ url, init })
            if (fail) throw new Error("Carrier unavailable")
            return url.endsWith("/calculate")
              ? {
                  shipping_option: {
                    id: "so_test",
                    calculated_price: { calculated_amount: 8 },
                  },
                }
              : { shipping_options: [{ id: "so_test" }] }
          },
        },
      },
    },
    "./cookies": {
      getAuthHeaders: async () => ({ authorization: "Bearer test" }),
    },
  })
  assert.equal(
    (await actions.listCartShippingMethods("cart_test"))[0].id,
    "so_test"
  )
  assert.equal(
    (await actions.calculatePriceForShippingOption("so_test", "cart_test"))
      .calculated_price.calculated_amount,
    8
  )
  assert.deepEqual(calls[0].init.query, { cart_id: "cart_test" })
  assert.equal(calls[0].init.cache, "no-store")
  assert.equal(calls[1].url, "/store/shipping-options/so_test/calculate")
  assert.equal(calls[1].init.method, "POST")
  assert.equal(JSON.stringify(calls[1].init.body), '{"cart_id":"cart_test"}')
  assert.equal(calls[1].init.cache, "no-store")
  fail = true
  await assert.rejects(
    actions.listCartShippingMethods("cart_test"),
    /Carrier unavailable/
  )
  await assert.rejects(
    actions.calculatePriceForShippingOption("so_test", "cart_test"),
    /Carrier unavailable/
  )
  fail = false
  assert.equal((await actions.listCartShippingMethods("cart_test")).length, 1)
})
function cartActions(cartId = "cart_test") {
  const updates = [],
    selections = [],
    tags = []
  const actions = load("src/lib/data/cart.ts", {
    "@lib/config": {
      sdk: {
        store: {
          cart: {
            update: async (id, data) => {
              updates.push({ id, data })
              return { cart: { ...cart, ...data } }
            },
            addShippingMethod: async (id, data) => {
              selections.push({ id, data })
              return { cart }
            },
          },
        },
      },
    },
    "@lib/util/medusa-error": {
      __esModule: true,
      default: (e) => {
        throw e
      },
    },
    "@lib/util/shipping": helpers,
    "next/cache": { revalidateTag: (tag) => tags.push(tag) },
    "next/navigation": {
      redirect: (url) => {
        throw new Error("REDIRECT:" + url)
      },
    },
    "./cookies": {
      getCartId: async () => cartId,
      getAuthHeaders: async () => ({}),
      getCacheTag: async (name) => name,
    },
    "./regions": {},
    "@lib/data/locale-actions": {},
  })
  return { actions, updates, selections, tags }
}
function addressForm() {
  const form = new FormData()
  for (const [key, value] of Object.entries(address))
    form.set("shipping_address." + key, value)
  form.set("shipping_address.country_code", "us")
  form.set("shipping_address.province", " ny ")
  form.set("email", "test@example.com")
  form.set("same_as_billing", "on")
  return form
}
test("complete address including apartment is saved before delivery redirect", async () => {
  const { actions, updates, tags } = cartActions()
  await assert.rejects(
    actions.setAddresses(null, addressForm()),
    /REDIRECT:\/us\/checkout\?step=delivery/
  )
  assert.deepEqual(updates[0].data.shipping_address, {
    ...address,
    province: "NY",
    company: "",
  })
  assert.deepEqual(
    updates[0].data.billing_address,
    updates[0].data.shipping_address
  )
  assert.deepEqual(tags, ["carts", "fulfillment"])
})
test("invalid US address and missing cart cookie do not save or advance", async () => {
  const { actions, updates } = cartActions()
  const form = addressForm()
  form.delete("shipping_address.province")
  assert.match(await actions.setAddresses(null, form), /state code/)
  assert.equal(updates.length, 0)
  const missing = cartActions(null)
  assert.match(
    await missing.actions.setAddresses(null, addressForm()),
    /No existing cart/
  )
  assert.equal(missing.updates.length, 0)
})
test("selection sends only option_id and invalidates backend cart totals", async () => {
  const { actions, selections, tags } = cartActions()
  await actions.setShippingMethod({
    cartId: "cart_test",
    shippingMethodId: "so_test",
  })
  assert.deepEqual(selections, [
    { id: "cart_test", data: { option_id: "so_test" } },
  ])
  assert.deepEqual(tags, ["carts"])
})
test("cart and order summaries render backend shipping and totals, including genuine zero", () => {
  const React = require("react")
  const { renderToStaticMarkup } = require("react-dom/server")
  const money = load("src/lib/util/money.ts", {
    "./isEmpty": load("src/lib/util/isEmpty.ts"),
  })
  const CartTotals = load(
    "src/modules/common/components/cart-totals/index.tsx",
    { "@lib/util/money": money }
  ).default
  const OrderSummary = load(
    "src/modules/order/components/order-summary/index.tsx",
    { "@lib/util/money": money }
  ).default
  const totals = {
    currency_code: "usd",
    item_subtotal: 40,
    subtotal: 40,
    tax_total: 0,
    shipping_subtotal: 8,
    shipping_total: 8,
    total: 48,
    shipping_methods: [{ id: "sm_1" }],
  }
  const markup = renderToStaticMarkup(
    React.createElement(CartTotals, { totals })
  )
  assert.match(markup, /data-testid="cart-shipping" data-value="8"/)
  assert.match(markup, /data-testid="cart-total" data-value="48"/)
  const unselected = renderToStaticMarkup(
    React.createElement(CartTotals, {
      totals: { ...totals, shipping_methods: [] },
    })
  )
  assert.match(unselected, /Calculated at checkout/)
  const order = renderToStaticMarkup(
    React.createElement(OrderSummary, { order: totals })
  )
  assert.match(order, /\$8\.00/)
  assert.match(order, /\$48\.00/)
  assert.match(order, /\$0\.00/)
})
