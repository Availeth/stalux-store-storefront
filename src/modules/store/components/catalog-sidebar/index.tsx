"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { CatalogFilters, engineeringFilters } from "@lib/util/catalog-filters"

type CategoryOption = { id: string; name: string; handle: string }

export default function CatalogSidebar({
  categories,
  filters,
}: {
  categories: CategoryOption[]
  filters: CatalogFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasFilters = Boolean(
    filters.category || filters.voltage || filters.ip || filters.inStock
  )

  const updateFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    for (const key of ["category", "voltage", "ip", "in_stock", "page"])
      params.delete(key)
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  const categoryClass = (active: boolean) =>
    [
      "flex min-h-11 w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a51634]",
      active
        ? "bg-[#f7e8ec] text-[#a51634]"
        : "text-[#4f5e74] hover:bg-[#f4f6fa]",
    ].join(" ")

  return (
    <aside
      aria-label="Catalog filters"
      className="h-fit border border-[#dbe0e8] bg-white p-5 small:sticky small:top-[13rem]"
      data-testid="catalog-sidebar"
    >
      <div className="flex flex-col items-start gap-3">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6f7f95]">
            Product Categories
          </h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[#9ba8b9]">
            Industrial Automation
          </p>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 text-xs font-semibold text-[#a51634] underline underline-offset-4 hover:text-[#870f29]"
          >
            Clear filters
          </button>
        )}
      </div>

      <ul className="mt-6 space-y-2" aria-label="Product categories">
        <li>
          <button
            type="button"
            onClick={() => updateFilter("category")}
            aria-pressed={!filters.category}
            className={categoryClass(!filters.category)}
          >
            All products
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => updateFilter("category", category.handle)}
              aria-pressed={filters.category === category.handle}
              className={categoryClass(filters.category === category.handle)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-[#e1e5ec] pt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a97a9]">
          Engineering Focus
        </h3>
        <ul
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Engineering specifications"
        >
          {engineeringFilters.map((filter) => {
            const active = filters[filter.key] === filter.value
            return (
              <li key={filter.value}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    updateFilter(filter.key, active ? undefined : filter.value)
                  }
                  className={`min-h-9 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a51634] ${
                    active
                      ? "border-[#a51634] bg-[#f7e8ec] text-[#a51634]"
                      : "border-transparent bg-[#eef2f7] text-[#5f6f86] hover:border-[#bdc9da]"
                  }`}
                >
                  {filter.label}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-[#8a97a9]">
          Filter by voltage and protection rating.
        </p>
      </div>

      <div className="mt-8 border-t border-[#e1e5ec] pt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a97a9]">
          Availability
        </h3>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-xs font-medium text-[#5f6f86]">
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(event) =>
              updateFilter(
                "in_stock",
                event.target.checked ? "true" : undefined
              )
            }
            className="h-4 w-4 rounded border-[#bdc9da] text-[#a51634] focus:ring-[#a51634]"
          />
          In stock only
        </label>
      </div>
    </aside>
  )
}
