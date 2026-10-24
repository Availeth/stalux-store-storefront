import { Suspense } from "react"
import { notFound } from "next/navigation"

import { listCategories } from "@lib/data/categories"
import { CatalogFilters } from "@lib/util/catalog-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CatalogSidebar from "@modules/store/components/catalog-sidebar"
import CatalogSort from "@modules/store/components/catalog-sort"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  query,
  filters = {},
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  query?: string
  filters?: CatalogFilters
}) => {
  const categories = await listCategories({
    fields: "id,name,handle,parent_category_id",
  })
  const selectedCategory = categories.find(
    (category) => category.handle === filters.category
  )
  if (filters.category && !selectedCategory) notFound()
  const parsedPage = Number(page || 1)
  const pageNumber =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const sort = sortBy || "created_at"
  const withoutSearch = new URLSearchParams()
  if (filters.category) withoutSearch.set("category", filters.category)
  if (filters.voltage) withoutSearch.set("voltage", filters.voltage)
  if (filters.ip) withoutSearch.set("ip", filters.ip)
  if (filters.inStock) withoutSearch.set("in_stock", "true")
  if (sortBy) withoutSearch.set("sortBy", sortBy)
  const clearSearchHref = `/store${
    withoutSearch.size ? `?${withoutSearch.toString()}` : ""
  }`

  return (
    <section
      className="bg-[#f7f8fb] py-8 small:py-10"
      data-testid="category-container"
    >
      <div className="content-container">
        <div className="grid gap-8 small:grid-cols-[18rem_minmax(0,1fr)] small:items-start">
          <CatalogSidebar
            categories={categories.map(({ id, name, handle }) => ({
              id,
              name,
              handle,
            }))}
            filters={filters}
          />
          <div className="min-w-0">
            <div className="mb-10 flex flex-col gap-6 border-b border-[#d9dee6] pb-6 medium:flex-row medium:items-end medium:justify-between">
              <div>
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.32em] text-[#9e0027]">
                  {query ? "Catalog Search" : "System Inventory v4.1"}
                </span>
                <h1
                  className="text-[clamp(2rem,4vw,3.4rem)] font-black uppercase leading-none tracking-[-0.03em] text-[#1a1f28]"
                  data-testid="store-page-title"
                >
                  {query
                    ? "Search Results"
                    : selectedCategory?.name || "Industrial Catalog"}
                </h1>
                <p className="mt-3 max-w-2xl break-words text-sm text-[#5b6474]">
                  {query
                    ? `Showing product matches for "${query}"${
                        selectedCategory ? ` in ${selectedCategory.name}` : ""
                      }.`
                    : "Browse Stalux automation inventory with real-time pricing and engineering-first product metadata."}
                </p>
                {query && (
                  <LocalizedClientLink
                    href={clearSearchHref}
                    className="mt-3 inline-block text-sm font-semibold text-[#a51634] underline underline-offset-4 hover:text-[#870f29]"
                  >
                    Clear search
                  </LocalizedClientLink>
                )}
              </div>
              <CatalogSort sortBy={sort} />
            </div>
            <Suspense
              key={`${query || ""}:${sort}:${pageNumber}:${JSON.stringify(
                filters
              )}`}
              fallback={<SkeletonProductGrid />}
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                view="catalog"
                query={query}
                categoryId={selectedCategory?.id}
                filters={filters}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreTemplate
