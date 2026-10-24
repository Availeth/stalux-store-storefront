import { HttpTypes } from "@medusajs/types"

export function shippingAddressError(
  address?: Partial<HttpTypes.StoreCartAddress> | null
): string | null {
  if (
    !address ||
    [
      address.first_name,
      address.last_name,
      address.address_1,
      address.city,
      address.postal_code,
      address.country_code,
    ].some((value) => !value?.trim())
  ) {
    return "Enter a complete shipping address before requesting rates."
  }
  if (address.country_code?.toLowerCase() === "us") {
    if (!/^[A-Za-z]{2}$/.test(address.province?.trim() || "")) {
      return "Enter your two-letter US state code (for example, NY)."
    }
    if (!/^\d{5}(-\d{4})?$/.test(address.postal_code?.trim() || "")) {
      return "Enter a valid US ZIP code."
    }
  }
  return null
}

// Changing a shipping method must not invalidate quotes; changing its inputs must.
export function shippingRatesKey(cart: HttpTypes.StoreCart): string {
  return JSON.stringify([
    cart.id,
    cart.region_id,
    cart.currency_code,
    cart.email,
    cart.shipping_address,
    cart.items?.map((item) => [
      item.id,
      item.variant_id,
      item.quantity,
      item.unit_price,
      item.metadata,
    ]),
    cart.promotions,
  ])
}

export function shippingOptionAmount(
  option: HttpTypes.StoreCartShippingOption
): number {
  const amount =
    option.price_type === "calculated"
      ? option.calculated_price?.calculated_amount
      : option.amount
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    throw new Error("Rate unavailable. Please retry.")
  }
  return amount
}
