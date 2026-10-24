"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react"
import {
  ArrowRightMini,
  BarsThree,
  ShoppingCart,
  User,
  XMark,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { useParams, usePathname } from "next/navigation"

import { Locale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"

const navigation = [
  { label: "Home", href: "/", description: "Discover Stalux Automation" },
  {
    label: "Product catalog",
    href: "/store",
    description: "Find your next component",
  },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

export default function SideMenu({
  regions,
  locales,
  currentLocale,
}: SideMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const close = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        data-testid="nav-menu-button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-base px-2 text-xs font-semibold text-[#1b3f73] transition-colors hover:bg-[#edf1f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1b3f73] xsmall:px-3"
      >
        <BarsThree className="h-6 w-6" aria-hidden="true" />
        <span className="hidden medium:inline">Menu</span>
      </button>

      <Dialog open={isOpen} onClose={close} className="relative z-[100]">
        <DialogBackdrop
          transition
          data-testid="side-menu-backdrop"
          className="fixed inset-0 bg-[#10253e]/40 backdrop-blur-sm transition-opacity duration-300 data-[closed]:opacity-0 motion-reduce:transition-none"
        />
        <div className="fixed inset-0 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex max-w-full">
            <DialogPanel
              transition
              data-testid="nav-menu-popup"
              className="pointer-events-auto flex h-full w-screen max-w-[26rem] flex-col bg-white text-[#1b3f73] shadow-2xl transition-transform duration-300 ease-out data-[closed]:translate-x-full motion-reduce:transition-none"
            >
              <div className="flex items-center justify-between border-b border-[#e1e7ee] px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c21d2e]">
                    Stalux Automation
                  </p>
                  <DialogTitle className="mt-1 text-xl font-semibold tracking-tight">
                    Explore Stalux
                  </DialogTitle>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  data-testid="close-menu-button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e1e7ee] transition-colors hover:bg-[#edf1f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1b3f73]"
                >
                  <XMark className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#758296]">
                  Navigation
                </p>
                <nav aria-label="Menu navigation">
                  {navigation.map(({ label, href, description }) => {
                    const active =
                      pathname === `/${countryCode}${href === "/" ? "" : href}`
                    return (
                      <LocalizedClientLink
                        key={href}
                        href={href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        data-testid={href === "/" ? "home-link" : "store-link"}
                        className={`group mb-2 flex items-center justify-between rounded-base border px-4 py-4 transition-colors ${
                          active
                            ? "border-[#dce4ef] bg-[#f0f4f9]"
                            : "border-transparent hover:border-[#e1e7ee] hover:bg-[#f7f9fc]"
                        }`}
                      >
                        <span>
                          <span className="block text-lg font-semibold tracking-tight">
                            {label}
                          </span>
                          <span className="mt-1 block text-xs text-[#758296]">
                            {description}
                          </span>
                        </span>
                        <ArrowRightMini
                          className="h-5 w-5 text-[#c21d2e] transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </LocalizedClientLink>
                    )
                  })}
                </nav>

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#e1e7ee] pt-6">
                  {[
                    { label: "My account", href: "/account", Icon: User },
                    {
                      label: "Shopping cart",
                      href: "/cart",
                      Icon: ShoppingCart,
                    },
                  ].map(({ label, href, Icon }) => (
                    <LocalizedClientLink
                      key={href}
                      href={href}
                      onClick={close}
                      data-testid={
                        href === "/account" ? "account-link" : "cart-link"
                      }
                      className="flex flex-col items-start gap-3 rounded-base border border-[#e1e7ee] p-4 text-sm font-semibold transition-colors hover:border-[#bccbdf] hover:bg-[#f7f9fc]"
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      {label}
                    </LocalizedClientLink>
                  ))}
                </div>

                <div className="mt-8 space-y-4 border-t border-[#e1e7ee] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#758296]">
                    Your preferences
                  </p>
                  {!!regions?.length && <CountrySelect regions={regions} />}
                  {!!locales?.length && (
                    <LanguageSelect
                      locales={locales}
                      currentLocale={currentLocale}
                    />
                  )}
                </div>
              </div>

              <div className="border-t border-[#e1e7ee] bg-[#f7f9fc] px-6 py-5">
                <p className="text-xs font-semibold">
                  Precision components. Expert support.
                </p>
                <p className="mt-2 text-[10px] text-[#758296]">
                  &copy; {new Date().getFullYear()} Stalux Automation
                </p>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}
