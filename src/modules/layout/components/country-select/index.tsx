"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useParams, usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import ReactCountryFlag from "react-country-flag"

import { updateRegion } from "@lib/data/cart"

export default function CountrySelect({
  regions,
}: {
  regions: HttpTypes.StoreRegion[]
}) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const options = regions
    .flatMap((region) =>
      (region.countries ?? []).flatMap((country) =>
        country.iso_2
          ? [
              {
                country: country.iso_2,
                label:
                  country.display_name ||
                  country.name ||
                  country.iso_2.toUpperCase(),
              },
            ]
          : []
      )
    )
    .sort((a, b) => a.label.localeCompare(b.label))
  const current = options.find((option) => option.country === countryCode)

  const handleChange = (country: string) => {
    setError("")
    startTransition(async () => {
      try {
        await updateRegion(
          country,
          pathname.slice(countryCode.length + 1) || "/"
        )
      } catch {
        setError(
          "Unable to update your shipping destination. Please try again."
        )
      }
    })
  }

  return (
    <div>
      <Listbox value={countryCode} onChange={handleChange} disabled={isPending}>
        <div className="relative">
          <ListboxButton
            aria-label="Shipping destination"
            className="flex w-full items-center justify-between gap-3 rounded-base border border-[#dce3ec] bg-white px-3 py-3 text-left text-sm disabled:opacity-60"
          >
            <span>
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#758296]">
                Shipping to
              </span>
              <span className="flex items-center gap-2 font-medium">
                <ReactCountryFlag
                  svg
                  countryCode={countryCode}
                  aria-hidden="true"
                />
                {isPending
                  ? "Updating..."
                  : current?.label || countryCode.toUpperCase()}
              </span>
            </span>
            <ChevronDownMini className="h-4 w-4" aria-hidden="true" />
          </ListboxButton>
          <ListboxOptions className="absolute bottom-full z-10 mb-2 max-h-56 w-full overflow-y-auto rounded-base border border-[#dce3ec] bg-white p-1 shadow-xl focus:outline-none">
            {options.map((option) => (
              <ListboxOption
                key={option.country}
                value={option.country}
                className="flex cursor-pointer items-center gap-2 rounded-base px-3 py-2.5 text-sm data-[focus]:bg-[#edf1f6] data-[selected]:font-semibold data-[selected]:text-[#c21d2e]"
              >
                <ReactCountryFlag
                  svg
                  countryCode={option.country}
                  aria-hidden="true"
                />
                {option.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[#c21d2e]">
          {error}
        </p>
      )}
    </div>
  )
}
