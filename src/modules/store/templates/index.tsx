import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CatalogSidebar from "@modules/store/components/catalog-sidebar"
import CatalogSort from "@modules/store/components/catalog-sort"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <section
      className="bg-[#f7f8fb] py-8 small:py-10"
      data-testid="category-container"
    >
      <div className="content-container">
        <div className="grid gap-8 small:grid-cols-[18rem_minmax(0,1fr)] small:items-start">
          <CatalogSidebar />
          <div className="min-w-0">
            <div className="mb-10 flex flex-col gap-6 border-b border-[#d9dee6] pb-6 medium:flex-row medium:items-end medium:justify-between">
              <div>
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.32em] text-[#9e0027]">
                  System Inventory v4.1
                </span>
                <h1
                  className="text-[clamp(2rem,4vw,3.4rem)] font-black uppercase leading-none tracking-[-0.03em] text-[#1a1f28]"
                  data-testid="store-page-title"
                >
                  Industrial Catalog
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-[#5b6474]">
                  Browse Stalux automation inventory with real-time pricing and
                  engineering-first product metadata.
                </p>
              </div>
              <CatalogSort sortBy={sort} />
            </div>
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                view="catalog"
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreTemplate
