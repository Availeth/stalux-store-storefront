import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { CatalogFilters } from "@lib/util/catalog-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import CatalogProductCard from "@modules/store/components/catalog-product-card"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  view = "default",
  query,
  filters,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  view?: "default" | "catalog"
  query?: string
  filters?: CatalogFilters
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (query) {
    queryParams.q = query
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    filters,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  const isCatalogView = view === "catalog"

  if (view === "catalog" && products.length === 0) {
    return (
      <div
        className="border border-[#dde3eb] bg-white px-6 py-12"
        data-testid={query ? "search-empty-state" : "catalog-empty-state"}
      >
        <p
          role="status"
          data-testid="catalog-results-count"
          className="mb-3 text-sm text-[#5b6474]"
        >
          {count} {count === 1 ? "product" : "products"} found
        </p>
        <h2 className="text-xl font-bold text-[#1a1f28]">No products found</h2>
        <p className="mt-3 break-words text-sm text-[#5b6474]">
          {count > 0
            ? "There are no products on this page. Return to the catalog to browse available products."
            : "No products match your current search or filters. Try another category or browse the full catalog."}
        </p>
        <LocalizedClientLink
          href="/store"
          className="mt-6 inline-block bg-[#a51634] px-4 py-3 text-sm font-semibold text-white hover:bg-[#870f29]"
        >
          Browse all products
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <>
      {isCatalogView && (
        <p
          role="status"
          data-testid="catalog-results-count"
          className="mb-5 text-sm text-[#5b6474]"
        >
          {count} {count === 1 ? "product" : "products"} found
        </p>
      )}
      <ul
        className={
          isCatalogView
            ? "grid w-full grid-cols-1 gap-x-6 gap-y-8 xsmall:grid-cols-2 medium:grid-cols-3 large:grid-cols-4"
            : "grid w-full grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4"
        }
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              {isCatalogView ? (
                <CatalogProductCard product={p} />
              ) : (
                <ProductPreview product={p} region={region} />
              )}
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
          variant={isCatalogView ? "catalog" : "default"}
        />
      )}
    </>
  )
}
