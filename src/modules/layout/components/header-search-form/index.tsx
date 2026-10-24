"use client"

import { MagnifyingGlass } from "@medusajs/icons"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, Suspense, useEffect, useState } from "react"

function SearchForm() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q")?.trim() || ""
  const [value, setValue] = useState(query)

  useEffect(() => {
    setValue(query)
  }, [query])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = value.trim()
    const params = new URLSearchParams()

    if (term) {
      params.set("q", term)
    }

    setValue(term)
    router.push(`/${countryCode}/store${term ? `?${params.toString()}` : ""}`)
  }

  return (
    <form
      action={`/${countryCode}/store`}
      method="get"
      role="search"
      aria-label="Search catalog products"
      onSubmit={handleSubmit}
      className="flex h-11 w-full items-center overflow-hidden rounded-base border border-[#ccd5e0] bg-[#f7f9fc] text-[#1b3f73] transition-[border-color,box-shadow,background-color] focus-within:border-[#1b3f73] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1b3f73]/10 small:h-12"
    >
      <input
        type="search"
        name="q"
        aria-label="Search catalog products"
        placeholder="Search the product catalog"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-[#1b3f73] placeholder:text-[#69798e] focus:outline-none focus:ring-0 small:px-4 small:text-sm"
      />
      <button
        type="submit"
        aria-label="Submit product search"
        className="inline-flex h-full w-11 shrink-0 items-center justify-center border-l border-[#dce3ec] bg-white transition-colors hover:bg-[#edf1f6] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1b3f73] small:w-12"
      >
        <MagnifyingGlass className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  )
}

export default function HeaderSearchForm({
  className,
}: {
  className?: string
}) {
  return (
    <div className={className}>
      <Suspense fallback={<div className="h-11 w-full small:h-12" />}>
        <SearchForm />
      </Suspense>
    </div>
  )
}
