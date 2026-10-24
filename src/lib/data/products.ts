"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import {
  CatalogFilters,
  productMatchesCatalogFilters,
} from "@lib/util/catalog-filters"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+variants.metadata,*variants.options",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * Apply specification filters and price sorting before pagination so counts and
 * page contents describe the same complete result set.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
  filters,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  sortBy?: SortOptions
  countryCode: string
  filters?: CatalogFilters
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  const limit = queryParams?.limit || 12

  const currentPage = Math.max(1, page)
  const hasLocalFilters = Boolean(
    filters?.voltage || filters?.ip || filters?.inStock
  )
  if (sortBy === "created_at" && !hasLocalFilters) {
    return listProducts({
      pageParam: currentPage,
      queryParams: { ...queryParams, order: "-created_at" },
      countryCode,
    })
  }

  const products: HttpTypes.StoreProduct[] = []
  let batchPage = 1
  let nextBatch: number | null = 1

  while (nextBatch !== null) {
    const batch = await listProducts({
      pageParam: batchPage,
      queryParams: { ...queryParams, limit: 100 },
      countryCode,
    })
    products.push(...batch.response.products)
    nextBatch = batch.response.products.length ? batch.nextPage : null
    batchPage += 1
  }

  const matchingProducts = filters
    ? products.filter((product) =>
        productMatchesCatalogFilters(product, filters)
      )
    : products
  const count = matchingProducts.length
  const sortedProducts = sortProducts(matchingProducts, sortBy)

  const pageParam = (currentPage - 1) * limit

  const nextPage = count > pageParam + limit ? currentPage + 1 : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
