"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Locale } from "@lib/data/locales"
import { updateLocale } from "@lib/data/locale-actions"

export default function LanguageSelect({
  locales,
  currentLocale,
}: {
  locales: Locale[]
  currentLocale: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()
  const options = [
    { code: "", name: "Default" },
    ...locales.map((locale) => {
      let name = locale.name
      try {
        name =
          new Intl.DisplayNames([currentLocale || "en-US"], {
            type: "language",
          }).of(locale.code) || locale.name
      } catch {}
      return { code: locale.code, name }
    }),
  ]
  const selected =
    options.find(
      (option) => option.code.toLowerCase() === currentLocale?.toLowerCase()
    ) || options[0]

  const handleChange = (code: string) => {
    setError("")
    startTransition(async () => {
      try {
        await updateLocale(code)
        router.refresh()
      } catch {
        setError("Unable to update your language. Please try again.")
      }
    })
  }

  return (
    <div>
      <Listbox
        value={selected.code}
        onChange={handleChange}
        disabled={isPending}
      >
        <div className="relative">
          <ListboxButton
            aria-label="Language"
            className="flex w-full items-center justify-between gap-3 rounded-base border border-[#dce3ec] bg-white px-3 py-3 text-left text-sm disabled:opacity-60"
          >
            <span>
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#758296]">
                Language
              </span>
              <span className="font-medium">
                {isPending ? "Updating..." : selected.name}
              </span>
            </span>
            <ChevronDownMini className="h-4 w-4" aria-hidden="true" />
          </ListboxButton>
          <ListboxOptions className="absolute bottom-full z-10 mb-2 max-h-56 w-full overflow-y-auto rounded-base border border-[#dce3ec] bg-white p-1 shadow-xl focus:outline-none">
            {options.map((option) => (
              <ListboxOption
                key={option.code}
                value={option.code}
                className="cursor-pointer rounded-base px-3 py-2.5 text-sm data-[focus]:bg-[#edf1f6] data-[selected]:font-semibold data-[selected]:text-[#c21d2e]"
              >
                {option.name}
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
