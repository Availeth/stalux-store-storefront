import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { Suspense } from "react"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Optional notices stream independently of the page and cart controls.
async function CartNotices() {
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
  ])

  if (!cart) return null

  return (
    <>
      {customer && <CartMismatchBanner customer={customer} cart={cart} />}
      <Suspense fallback={null}>
        <ShippingNotice cart={cart} />
      </Suspense>
    </>
  )
}

async function ShippingNotice({
  cart,
}: {
  cart: NonNullable<Awaited<ReturnType<typeof retrieveCart>>>
}) {
  const { shipping_options } = await listCartOptions()
  return (
    <FreeShippingPriceNudge
      variant="popup"
      cart={cart}
      shippingOptions={shipping_options}
    />
  )
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <CartNotices />
      </Suspense>
      {props.children}
    </>
  )
}
