import {
  ArrowPath,
  ShieldCheck,
  ShoppingCart,
  Target,
  TruckFast,
  User,
  UserGroup,
} from "@medusajs/icons"
import Image from "next/image"
import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderSearchForm from "@modules/layout/components/header-search-form"
import SideMenu from "@modules/layout/components/side-menu"

const headerHighlights = [
  {
    label: "Fast Shipping",
    Icon: TruckFast,
  },
  {
    label: "Industry Leading Support",
    Icon: ShieldCheck,
  },
  {
    label: "Guaranteed Exact Fit",
    Icon: Target,
  },
  {
    label: "Easy Returns",
    Icon: ArrowPath,
  },
  {
    label: "30 Years of Service",
    Icon: UserGroup,
  },
]

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky inset-x-0 top-0 z-50 border-b border-[#d8dfe8] bg-[#f4f6f8]">
      <div className="bg-[#c21d2e] py-2">
        <p className="px-4 text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-white xsmall:text-[11px] small:text-[12px]">
          Global Supplier - Expert Support - Fast Shipping
        </p>
      </div>

      <header className="bg-white">
        <div className="content-container py-3 small:py-4">
          <nav
            aria-label="Main navigation"
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-3 xsmall:gap-x-4 small:grid-cols-[auto_minmax(0,1fr)_auto] small:gap-x-8"
          >
            <LocalizedClientLink
              href="/"
              className="block w-[7.5rem] shrink-0 xsmall:w-[8.5rem] small:w-[9rem]"
              data-testid="nav-store-link"
            >
              <Image
                src="/stalux-logo.png"
                alt="Stalux Automation"
                width={1014}
                height={676}
                sizes="(max-width: 511px) 120px, (max-width: 1023px) 136px, 144px"
                className="h-auto w-full object-contain"
                priority
              />
            </LocalizedClientLink>

            <HeaderSearchForm className="col-span-2 row-start-2 w-full min-w-0 small:col-span-1 small:col-start-2 small:row-start-1 small:max-w-[48rem] small:justify-self-center" />

            <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-0.5 text-[#1b3f73] xsmall:gap-2 small:col-start-3">
              <div className="h-full">
                <SideMenu
                  regions={regions}
                  locales={locales}
                  currentLocale={currentLocale}
                />
              </div>
              <LocalizedClientLink
                className="inline-flex h-11 items-center justify-center gap-2 rounded-base px-2 text-xs font-semibold transition-colors hover:bg-[#edf1f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1b3f73] xsmall:px-3"
                href="/account"
                data-testid="nav-account-link"
                aria-label="Account"
              >
                <User className="h-6 w-6" aria-hidden="true" />
                <span className="hidden medium:inline">Account</span>
              </LocalizedClientLink>
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-base text-[#1b3f73] hover:bg-[#edf1f6]"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute right-0 top-0 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c21d2e] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                      0
                    </span>
                    <span className="sr-only">Cart (0)</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </nav>
        </div>
      </header>

      <div className="bg-[#f4f6f8]">
        <div className="content-container border-t border-[#d8dfe8]">
          <ul className="flex items-center gap-6 overflow-x-auto py-2.5 text-[#1b3f73] no-scrollbar small:justify-between">
            {headerHighlights.map(({ label, Icon }) => {
              return (
                <li
                  key={label}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-medium"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
