"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChangeEvent } from "react"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const sortOptions: { label: string; value: SortOptions }[] = [
  {
    label: "Newest Release",
    value: "created_at",
  },
  {
    label: "Price: Low to High",
    value: "price_asc",
  },
  {
    label: "Price: High to Low",
    value: "price_desc",
  },
]

export default function CatalogSort({ sortBy }: { sortBy: SortOptions }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SortOptions
    const params = new URLSearchParams(searchParams)

    params.set("sortBy", value)
    params.delete("page")

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <label className="inline-flex items-center gap-3 bg-white px-3 py-2 text-[#4f5e74] shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a97a9]">
        Sort By
      </span>
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="border-none bg-transparent pr-8 text-xs font-bold uppercase tracking-[0.14em] text-[#2a3442] outline-none"
        aria-label="Sort catalog products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
