const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const React = require("react")

// Exercise the SDK boundary without opening PayPal or charging a payment.
function checkout({
  data = { order_id: "paypal_order" },
  status = "pending",
  clientId = "sandbox_client",
  script = { isResolved: true },
  notReady = false,
  complete = async () => undefined,
} = {}) {
  let index = 0
  const hooks = []
  const errors = []
  const state = { calls: [], buttons: null, options: null, retry: null }
  const mocks = {
    react: {
      useState(initial) {
        const key = index++
        if (!(key in hooks)) hooks[key] = initial
        return [
          hooks[key],
          (value) => {
            hooks[key] = value
          },
        ]
      },
      useRef(initial) {
        const key = index++
        if (!(key in hooks)) hooks[key] = { current: initial }
        return hooks[key]
      },
    },
    "@lib/data/cart": {
      placeOrder: async (id) => {
        state.calls.push(id)
        return complete()
      },
    },
    "@medusajs/ui": {
      Button: (props) => {
        state.retry = props
        return null
      },
    },
    "../error-message": {
      default: (props) => {
        if (props.error) errors.push(props.error)
        return null
      },
    },
    "@paypal/react-paypal-js": {
      PayPalScriptProvider: ({ options, children }) => {
        state.options = options
        return children
      },
      PayPalButtons: (props) => {
        state.buttons = props
        return null
      },
      usePayPalScriptReducer: () => [script],
    },
  }
  const source = ts.transpileModule(
    fs.readFileSync(
      "src/modules/checkout/components/payment-button/paypal-payment-button.tsx",
      "utf8"
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText
  const module = { exports: {} }
  new Function("require", "module", "exports", source)(
    (name) => mocks[name] ?? require(name),
    module,
    module.exports
  )
  const Component = module.exports.default
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== "object") return
    if (typeof node.type === "function") return visit(node.type(node.props))
    visit(node.props?.children)
  }
  state.render = () => {
    index = 0
    errors.length = 0
    state.buttons = state.retry = null
    const previous = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (clientId) process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = clientId
    else delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    try {
      visit(
        React.createElement(Component, {
          cart: { id: "cart_checkout", currency_code: "usd" },
          paymentSession: {
            id: "payses_checkout",
            provider_id: "pp_paypal_default",
            status,
            data,
          },
          notReady,
        })
      )
    } finally {
      if (previous === undefined)
        delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      else process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = previous
    }
    state.error = errors.join(" ")
  }
  state.render()
  return state
}

test("opens the backend order with matching currency and intent; completes only after matching approval", async () => {
  const state = checkout({
    data: { order_id: "paypal_order", intent: "CAPTURE" },
  })
  assert.equal(state.options.currency, "USD")
  assert.equal(state.options.intent, "capture")
  assert.equal(await state.buttons.createOrder(), "paypal_order")
  assert.deepEqual(state.calls, [])
  await state.buttons.onApprove({ orderID: "other_order" })
  assert.deepEqual(state.calls, [])
  state.render()
  assert.match(state.error, /session changed/)
  await state.buttons.onApprove({ orderID: "paypal_order" })
  assert.deepEqual(state.calls, ["cart_checkout"])
})

test("matches the nested PayPal order intent returned by the backend", async () => {
  for (const [data, intent] of [
    [{ order_id: "paypal_order", order: { intent: "CAPTURE" } }, "capture"],
    [{ order_id: "paypal_order", order: { intent: "AUTHORIZE" } }, "authorize"],
    [{ order_id: "paypal_order", intent: "AUTHORIZE" }, "authorize"],
    [{ order_id: "paypal_order", intent: "capture" }, "capture"],
    [{ order_id: "paypal_order" }, "capture"],
  ]) {
    const state = checkout({ data })
    assert.equal(state.options.intent, intent)
    assert.equal(await state.buttons.createOrder(), "paypal_order")
    assert.deepEqual(state.calls, [])
  }
})

test("cancel and SDK errors keep checkout open and allow another approval", async () => {
  const state = checkout()
  state.buttons.onCancel()
  state.render()
  assert.match(state.error, /cancelled/)
  state.buttons.onError({})
  state.render()
  assert.match(state.error, /could not process/)
  assert.deepEqual(state.calls, [])
  assert.equal(await state.buttons.createOrder(), "paypal_order")
})

test("missing configuration, SDK failure, and missing order prevent payment", () => {
  for (const [options, message] of [
    [{ clientId: null }, /temporarily unavailable/],
    [{ script: { isResolved: false, isRejected: true } }, /could not load/],
    [{ data: {} }, /session is unavailable/],
  ]) {
    const state = checkout(options)
    assert.equal(state.buttons, null)
    assert.match(state.error, message)
    assert.deepEqual(state.calls, [])
  }
})

test("incomplete checkout cannot create or complete an order", async () => {
  const state = checkout({ notReady: true })
  assert.equal(state.buttons.disabled, true)
  await assert.rejects(state.buttons.createOrder(), /not ready/)
  await state.buttons.onApprove({ orderID: "paypal_order" })
  assert.deepEqual(state.calls, [])
})

test("failed completion retries without a second approval, and duplicate callbacks are guarded", async () => {
  let release
  const state = checkout({
    complete: () =>
      new Promise((resolve) => {
        release = resolve
      }),
  })
  const approve = state.buttons.onApprove
  const first = approve({ orderID: "paypal_order" })
  await approve({ orderID: "paypal_order" })
  assert.equal(state.calls.length, 1)
  release({ id: "cart_checkout" })
  await first
  state.render()
  assert.match(state.error, /could not be completed/)
  assert.equal(state.buttons, null)
  assert.equal(state.retry.children, "Complete order")
  const retry = state.retry.onClick()
  release(undefined)
  await retry
  assert.equal(state.calls.length, 2)
})

test("authorized sessions resume cart completion and legacy order ID keys work", async () => {
  const state = checkout({ status: "authorized" })
  assert.equal(state.buttons, null)
  await state.retry.onClick()
  assert.deepEqual(state.calls, ["cart_checkout"])
  for (const data of [{ orderId: "legacy_order" }, { id: "legacy_order" }]) {
    const legacy = checkout({ data })
    assert.equal(legacy.options.intent, "capture")
    assert.equal(await legacy.buttons.createOrder(), "legacy_order")
  }
})
