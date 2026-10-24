"use client"

import { Transition } from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { ArrowRightMini, ShoppingCart, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useId, useRef, useState } from "react"

export default function CartDropdown({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelId = useId()
  const pathname = usePathname()
  const totalItems =
    cartState?.items?.reduce((total, item) => total + item.quantity, 0) || 0
  const previousTotal = useRef(totalItems)
  const subtotal = cartState?.subtotal ?? 0
  const items = [...(cartState?.items || [])].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime()
  )

  const cancelTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])
  const close = useCallback(() => {
    cancelTimer()
    setIsOpen(false)
  }, [cancelTimer])
  const open = () => {
    cancelTimer()
    setIsOpen(true)
  }
  const scheduleClose = () => {
    cancelTimer()
    timerRef.current = setTimeout(() => {
      if (!rootRef.current?.contains(document.activeElement)) setIsOpen(false)
    }, 180)
  }

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (
      previousTotal.current !== totalItems &&
      !pathname.includes("/cart") &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      cancelTimer()
      setIsOpen(true)
      timerRef.current = setTimeout(() => {
        if (
          !rootRef.current?.matches(":hover") &&
          !rootRef.current?.contains(document.activeElement)
        )
          setIsOpen(false)
      }, 5000)
    }
    previousTotal.current = totalItems
  }, [totalItems, pathname, cancelTimer])

  useEffect(() => cancelTimer, [cancelTimer])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        close()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, close])

  const cartIcon = (
    <>
      <ShoppingCart className="h-6 w-6" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c21d2e] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
      >
        {totalItems}
      </span>
    </>
  )
  const triggerClass =
    "relative h-11 w-11 items-center justify-center rounded-base text-[#1b3f73] transition-colors hover:bg-[#edf1f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1b3f73]"

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(min-width: 1024px)").matches
        )
          open()
      }}
      onPointerLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <LocalizedClientLink
        href="/cart"
        aria-label={`Cart (${totalItems})`}
        data-testid="nav-cart-link"
        className={`inline-flex small:hidden ${triggerClass}`}
      >
        {cartIcon}
      </LocalizedClientLink>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Open cart (${totalItems} ${
          totalItems === 1 ? "item" : "items"
        })`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        data-testid="nav-cart-button"
        className={`hidden small:inline-flex ${triggerClass}`}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault()
            open()
          }
        }}
      >
        {cartIcon}
      </button>

      <Transition
        show={isOpen}
        enter="transition duration-150 ease-out motion-reduce:transition-none"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition duration-100 ease-in motion-reduce:transition-none"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-2 opacity-0"
      >
        <div
          className="absolute right-0 top-full z-[60] hidden w-[390px] max-w-[calc(100vw-3rem)] pt-3 small:block"
          data-testid="nav-cart-dropdown"
        >
          <section
            id={panelId}
            aria-label="Shopping cart preview"
            className="overflow-hidden rounded-rounded border border-[#dce3ec] bg-white text-[#1b3f73] shadow-[0_18px_60px_-12px_rgba(16,37,62,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-[#e1e7ee] px-5 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">Your cart</h2>
                <span className="rounded-full bg-[#edf1f6] px-2 py-1 text-[10px] font-semibold">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close cart preview"
                onClick={close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#758296] hover:bg-[#edf1f6]"
              >
                <XMark className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {items.length && cartState ? (
              <>
                <div className="max-h-[min(22rem,45vh)] overflow-y-auto overscroll-contain divide-y divide-[#e1e7ee] px-5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      data-testid="cart-item"
                      className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5"
                    >
                      <LocalizedClientLink
                        href={`/products/${item.product_handle}`}
                        onClick={close}
                        aria-label={item.title}
                      >
                        <Thumbnail
                          thumbnail={item.thumbnail}
                          images={item.variant?.product?.images}
                          size="square"
                          className="rounded-base border border-[#e1e7ee] !p-2 !shadow-none"
                        />
                      </LocalizedClientLink>
                      <div className="min-w-0">
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          onClick={close}
                          data-testid="product-link"
                          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-[#c21d2e]"
                        >
                          {item.title}
                        </LocalizedClientLink>
                        {item.variant?.title &&
                          item.variant.title !== "Default Variant" && (
                            <p
                              data-testid="cart-item-variant"
                              className="mt-1 truncate text-xs text-[#758296]"
                            >
                              {item.variant.title}
                            </p>
                          )}
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                          <span
                            data-testid="cart-item-quantity"
                            className="text-[#758296]"
                          >
                            Qty {item.quantity}
                          </span>
                          <span
                            data-testid="product-price"
                            className="font-semibold"
                          >
                            {convertToLocale({
                              amount: item.total ?? 0,
                              currency_code: cartState.currency_code,
                            })}
                          </span>
                        </div>
                        <DeleteButton id={item.id} className="mt-2 text-xs">
                          Remove
                        </DeleteButton>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#e1e7ee] bg-[#f7f9fc] px-5 py-4">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Subtotal</span>
                    <span
                      className="text-lg"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#758296]">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <LocalizedClientLink
                    href="/cart"
                    onClick={close}
                    data-testid="go-to-cart-button"
                    className="mt-4 flex h-11 items-center justify-between rounded-base bg-[#c21d2e] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#a41626]"
                  >
                    View cart
                    <ArrowRightMini className="h-5 w-5" aria-hidden="true" />
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4f9]">
                  <ShoppingCart
                    className="h-7 w-7 text-[#7c91ac]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-semibold">
                  Ready for your next project?
                </h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#758296]">
                  Your cart is empty. Find the right components in our catalog.
                </p>
                <LocalizedClientLink
                  href="/store"
                  onClick={close}
                  className="mt-6 flex h-11 items-center justify-between rounded-base bg-[#c21d2e] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#a41626]"
                >
                  Explore products
                  <ArrowRightMini className="h-5 w-5" aria-hidden="true" />
                </LocalizedClientLink>
              </div>
            )}
          </section>
        </div>
      </Transition>
    </div>
  )
}
