import {
  ArrowPath,
  ChevronDownMini,
  MagnifyingGlass,
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
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
          Global Supplier - Expert Support - Fast Shipping
        </p>
      </div>

      <header className="bg-[#f4f6f8]">
        <div className="content-container py-4 small:py-5">
          <nav className="flex flex-col gap-4">
            <div className="flex items-center gap-3 small:gap-5">
              <LocalizedClientLink
                href="/"
                className="shrink-0"
                data-testid="nav-store-link"
              >
                <Image
                  src="/stalux-logo.png"
                  alt="Stalux Automation"
                  width={1014}
                  height={676}
                  className="h-auto w-auto small:h-20 object-contain"
                  priority
                />
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/store"
                className="hidden medium:flex flex-1 items-center justify-between border-[3px] border-[#d0d8e2] bg-white px-6 py-4 text-[#546684] shadow-sm transition-colors duration-200 hover:border-[#b9c6d6]"
              >
                <span className="text-[clamp(1rem,1.8vw,2rem)] leading-none font-medium">
                  Search staluxautomation.com
                </span>
                <MagnifyingGlass className="h-10 w-10 text-[#1b3f73]" />
              </LocalizedClientLink>

              <div className="ml-auto flex items-center gap-3 small:gap-6 text-[#1b3f73]">
                <div className="h-full">
                  <SideMenu
                    regions={regions}
                    locales={locales}
                    currentLocale={currentLocale}
                    className="gap-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#1b3f73] hover:text-[#122d55]"
                  />
                </div>
                <LocalizedClientLink
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#1b3f73] transition-colors duration-200 hover:text-[#122d55]"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  <User className="h-8 w-8" />
                  <span className="hidden small:inline">Account</span>
                </LocalizedClientLink>
                <Suspense
                  fallback={
                    <LocalizedClientLink
                      className="relative inline-flex h-10 w-10 items-center justify-center text-[#1b3f73] transition-colors duration-200 hover:text-[#122d55]"
                      href="/cart"
                      data-testid="nav-cart-link"
                    >
                      <ShoppingCart className="h-8 w-8" />
                      <span className="absolute -right-1 -top-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-[#d51f36] px-1 text-[10px] font-bold leading-none text-white">
                        0
                      </span>
                      <span className="sr-only">Cart (0)</span>
                    </LocalizedClientLink>
                  }
                >
                  <CartButton />
                </Suspense>
              </div>
            </div>

            <LocalizedClientLink
              href="/store"
              className="flex items-center justify-between border-[3px] border-[#d0d8e2] bg-white px-4 py-3 text-[#546684] shadow-sm transition-colors duration-200 hover:border-[#b9c6d6] medium:hidden"
            >
              <span className="text-base font-medium">
                Search staluxautomation.com
              </span>
              <MagnifyingGlass className="h-7 w-7 text-[#1b3f73]" />
            </LocalizedClientLink>
          </nav>
        </div>
      </header>

      <div className="bg-[#f4f6f8]">
        <div className="content-container border-t border-[#d8dfe8]">
          <ul className="flex items-center gap-6 overflow-x-auto py-4 text-[#1b3f73] no-scrollbar">
            {headerHighlights.map(({ label, Icon }) => {
              return (
                <li
                  key={label}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[1.03rem] font-semibold"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{label}</span>
                  <ChevronDownMini className="h-4 w-4 shrink-0" />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
