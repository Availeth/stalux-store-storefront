import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  const relatedProducts = products.slice(0, 4)

  return (
    <section className="mb-8">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#e3bebd]/25 pb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9e0027]">
            Related Products
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#1a1c1e] small:text-3xl">
            Essential System Complements
          </h2>
        </div>
        <p className="max-w-xs text-sm font-medium text-[#5b4040]">
          Compatible modules and accessories selected from the same catalog
          family.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 xsmall:grid-cols-2 small:grid-cols-4">
        {relatedProducts.map((relatedProduct) => {
          if (!relatedProduct.handle) {
            return null
          }

          const { cheapestPrice } = getProductPrice({
            product: relatedProduct,
          })

          const tagLabel = (
            relatedProduct.tags?.[0] as { value?: string } | undefined
          )?.value
          const seriesLabel =
            tagLabel ??
            relatedProduct.collection?.title ??
            relatedProduct.type?.value ??
            "Accessory"
          const productImage =
            relatedProduct.thumbnail || relatedProduct.images?.[0]?.url

          return (
            <li key={relatedProduct.id}>
              <LocalizedClientLink
                href={`/products/${relatedProduct.handle}`}
                className="group block h-full"
              >
                <article className="flex h-full flex-col bg-[#f3f3f6] p-5 transition-colors duration-200 hover:bg-[#e8e8ea]">
                  <div className="relative mb-4 aspect-square overflow-hidden bg-white p-4">
                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={relatedProduct.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="h-full w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#9aa7b8]">
                        <PlaceholderImage size={24} />
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9e0027]">
                    {seriesLabel}
                  </p>
                  <h3 className="mt-2 text-sm font-black uppercase leading-tight tracking-[0.03em] text-[#1a1c1e]">
                    {relatedProduct.title}
                  </h3>

                  <div className="mt-auto pt-4">
                    <p className="text-lg font-black tracking-tight text-[#1a1c1e]">
                      {cheapestPrice?.calculated_price || "Price on request"}
                    </p>
                  </div>
                </article>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
