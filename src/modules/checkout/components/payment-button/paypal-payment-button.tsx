"use client"

import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js"
import { useRef, useState } from "react"
import ErrorMessage from "../error-message"

type PayPalPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  paymentSession: HttpTypes.StorePaymentSession
  notReady: boolean
  "data-testid"?: string
}

const PayPalPaymentButton = (props: PayPalPaymentButtonProps) => {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    return (
      <ErrorMessage
        error="PayPal is temporarily unavailable. Please contact us for help with your order."
        data-testid="paypal-payment-error-message"
      />
    )
  }

  const { paymentSession, cart } = props
  // Our provider returns the PayPal API response under data.order. Match that
  // order's intent; PayPal rejects approval when the SDK uses a different one.
  const order = paymentSession.data?.order as
    | { intent?: string }
    | undefined
  const orderIntent = paymentSession.data?.intent ?? order?.intent
  const intent =
    typeof orderIntent === "string" && orderIntent.toUpperCase() === "AUTHORIZE"
      ? "authorize"
      : "capture"

  return (
    <PayPalScriptProvider
      key={`${paymentSession.id}-${cart.currency_code}-${intent}`}
      options={{
        clientId,
        currency: cart.currency_code.toUpperCase(),
        intent,
        components: "buttons",
      }}
    >
      <PayPalApprovalButton {...props} />
    </PayPalScriptProvider>
  )
}

const PayPalApprovalButton = ({
  cart,
  paymentSession,
  notReady,
  "data-testid": dataTestId,
}: PayPalPaymentButtonProps) => {
  const [{ isResolved, isRejected }] = usePayPalScriptReducer()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [approved, setApproved] = useState(
    paymentSession.status === "authorized"
  )
  const completing = useRef(false)

  // Providers initialize the PayPal order on the server; never create a second
  // order in the browser or authorize/capture funds here.
  const data = paymentSession.data
  const orderId = [data?.order_id, data?.orderId, data?.id].find(
    (value): value is string => typeof value === "string" && value.length > 0
  )

  const completeOrder = async () => {
    if (notReady || completing.current) return
    completing.current = true
    setSubmitting(true)
    setError(null)
    try {
      // Medusa verifies the approval and authorizes the payment before completing.
      const remainingCart = await placeOrder(cart.id)
      if (remainingCart) {
        throw new Error("Your order could not be completed. Please try again.")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your order could not be completed. Please try again."
      )
    } finally {
      completing.current = false
      setSubmitting(false)
    }
  }

  if (approved) {
    return (
      <>
        <Button
          disabled={notReady}
          isLoading={submitting}
          onClick={completeOrder}
          size="large"
          data-testid={dataTestId}
        >
          Complete order
        </Button>
        <ErrorMessage
          error={error}
          data-testid="paypal-payment-error-message"
        />
      </>
    )
  }

  const unavailable = isRejected
    ? "PayPal could not load. Please refresh the page and try again."
    : !orderId
    ? "Your PayPal session is unavailable. Please return to Payment and select PayPal again."
    : null

  return (
    <div className="max-w-sm" data-testid={dataTestId} aria-busy={submitting}>
      {unavailable ? null : !isResolved ? (
        <Button disabled isLoading size="large">
          Loading PayPal
        </Button>
      ) : (
        <PayPalButtons
          fundingSource="paypal"
          disabled={notReady || submitting}
          style={{ layout: "vertical", shape: "rect", label: "pay" }}
          createOrder={async () => {
            if (!orderId || notReady)
              throw new Error("PayPal session is not ready")
            setError(null)
            return orderId
          }}
          onApprove={async ({ orderID }) => {
            if (orderID !== orderId) {
              setError(
                "Your PayPal session changed. Please return to Payment and try again."
              )
              return
            }
            setApproved(true)
            await completeOrder()
          }}
          onCancel={() => {
            setError(
              "PayPal approval was cancelled. You can try again when you are ready."
            )
          }}
          onError={() => {
            setError("PayPal could not process your payment. Please try again.")
          }}
        />
      )}
      <div role="status" aria-live="polite">
        <ErrorMessage
          error={error || unavailable}
          data-testid="paypal-payment-error-message"
        />
      </div>
    </div>
  )
}

export default PayPalPaymentButton
