"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import {
  calculatePriceForShippingOption,
  listCartShippingMethods,
} from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { shippingAddressError, shippingOptionAmount } from "@lib/util/shipping"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, clx, Heading, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type Rate =
  | { amount: number; error?: never }
  | { amount?: never; error: string }

type ShippingOption = HttpTypes.StoreCartShippingOption &
  Partial<
    Pick<HttpTypes.StoreCartShippingOptionWithServiceZone, "service_zone">
  >

const Shipping = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [rates, setRates] = useState<Record<string, Rate>>({})
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = searchParams.get("step") === "delivery"
  const addressError = shippingAddressError(cart.shipping_address)
  const selectedMethod = cart.shipping_methods?.at(-1)
  const selectedId = selectedMethod?.shipping_option_id
  const selectedOption = options.find((option) => option.id === selectedId)
  const canContinue =
    !!selectedOption &&
    !selectedOption.insufficient_inventory &&
    typeof rates[selectedOption.id]?.amount === "number" &&
    !isLoadingPrices &&
    !pendingId &&
    !addressError &&
    !listError

  // CheckoutForm remounts this component when the address or cart contents change.
  // Ignore results from a previous attempt or an unmounted cart snapshot.
  useEffect(() => {
    let cancelled = false
    setIsLoadingPrices(true)
    setRates({})
    setListError(null)
    setError(null)

    async function loadRates() {
      if (addressError) {
        setIsLoadingPrices(false)
        return
      }
      try {
        const methods = await listCartShippingMethods(cart.id)
        if (cancelled) return
        setOptions(methods)
        const results = await Promise.allSettled(
          methods.map(async (option) => {
            if (option.insufficient_inventory) {
              throw new Error("Unavailable for the quantities in your cart.")
            }
            const quoted =
              option.price_type === "calculated"
                ? await calculatePriceForShippingOption(option.id, cart.id)
                : option
            return shippingOptionAmount(quoted)
          })
        )
        if (cancelled) return
        const nextRates: Record<string, Rate> = {}
        results.forEach((result, index) => {
          nextRates[methods[index].id] =
            result.status === "fulfilled"
              ? { amount: result.value }
              : {
                  error: methods[index].insufficient_inventory
                    ? "Unavailable for the quantities in your cart."
                    : "Rate unavailable. Please retry.",
                }
        })
        setRates(nextRates)
      } catch {
        if (!cancelled) {
          setOptions([])
          setListError("Unable to load shipping options. Please retry.")
        }
      } finally {
        if (!cancelled) setIsLoadingPrices(false)
      }
    }
    void loadRates()
    return () => {
      cancelled = true
    }
  }, [cart.id, addressError, attempt])

  async function handleSelect(id: string) {
    if (pendingId || isLoadingPrices || typeof rates[id]?.amount !== "number")
      return
    setError(null)
    setPendingId(id)
    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to select shipping. Please retry."
      )
    } finally {
      setPendingId(null)
    }
  }

  const hasRateErrors = Object.values(rates).some((rate) => !!rate.error)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex text-3xl-regular gap-x-2 items-baseline"
        >
          Delivery
          {!isOpen && selectedMethod && <CheckCircleSolid />}
        </Heading>
        {!isOpen && cart.shipping_address && (
          <Text>
            <button
              onClick={() =>
                router.push(pathname + "?step=delivery", { scroll: false })
              }
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-delivery-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <>
          <Text className="mb-4">Choose a shipping or pickup method.</Text>
          {addressError ? (
            <div role="alert">
              <ErrorMessage error={addressError} />
              <Button
                variant="secondary"
                onClick={() => router.push(pathname + "?step=address")}
              >
                Edit shipping address
              </Button>
            </div>
          ) : (
            <div
              data-testid="delivery-options-container"
              aria-busy={isLoadingPrices}
            >
              {isLoadingPrices ? (
                <div role="status" className="flex items-center gap-2 py-4">
                  <Loader className="animate-spin" /> Loading shipping rates…
                </div>
              ) : (
                <RadioGroup
                  value={selectedId ?? ""}
                  onChange={handleSelect}
                  aria-label="Shipping method"
                >
                  {options.map((option) => {
                    const rate = rates[option.id]
                    const location =
                      option.service_zone?.fulfillment_set?.location?.address
                    const disabled =
                      !!pendingId || typeof rate?.amount !== "number"
                    return (
                      <div key={option.id} className="mb-3">
                        <Radio
                          value={option.id}
                          disabled={disabled}
                          data-testid="delivery-option-radio"
                          className={clx(
                            "flex items-center justify-between text-small-regular py-4 border rounded-rounded px-6",
                            selectedId === option.id &&
                              "border-ui-border-interactive",
                            disabled
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          )}
                        >
                          <div className="flex items-center gap-x-4">
                            <MedusaRadio checked={selectedId === option.id} />
                            <div>
                              <span>{option.name}</span>
                              {option.service_zone?.fulfillment_set?.type ===
                                "pickup" &&
                                location && (
                                  <Text className="text-ui-fg-subtle">
                                    {[
                                      location.address_1,
                                      location.address_2,
                                      location.city,
                                      location.province,
                                      location.postal_code,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </Text>
                                )}
                            </div>
                          </div>
                          <span>
                            {pendingId === option.id ? (
                              <Loader className="animate-spin" />
                            ) : typeof rate?.amount === "number" ? (
                              convertToLocale({
                                amount: rate.amount,
                                currency_code: cart.currency_code,
                              })
                            ) : (
                              "Unavailable"
                            )}
                          </span>
                        </Radio>
                        {rate?.error && (
                          <div role="alert">
                            <ErrorMessage error={rate.error} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </RadioGroup>
              )}
              {!isLoadingPrices && !listError && options.length === 0 && (
                <Text role="status">
                  No shipping options are available for this address and cart.
                </Text>
              )}
              {listError && (
                <div role="alert">
                  <ErrorMessage error={listError} />
                </div>
              )}
              {!isLoadingPrices &&
                (listError || hasRateErrors || options.length === 0) && (
                  <Button
                    variant="secondary"
                    className="my-4"
                    onClick={() => setAttempt((value) => value + 1)}
                    data-testid="retry-shipping-rates-button"
                  >
                    Retry shipping rates
                  </Button>
                )}
            </div>
          )}
          <div role="alert">
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
          </div>
          <Button
            size="large"
            className="mt-6"
            onClick={() => {
              if (canContinue)
                router.push(pathname + "?step=payment", { scroll: false })
            }}
            isLoading={!!pendingId}
            disabled={!canContinue}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </>
      ) : selectedMethod ? (
        <Text className="txt-medium text-ui-fg-subtle">
          {selectedMethod.name}{" "}
          {convertToLocale({
            amount: selectedMethod.amount,
            currency_code: cart.currency_code,
          })}
        </Text>
      ) : null}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
