import { HttpTypes } from "@medusajs/types"
import { Heading, Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const productVariants = product.variants ?? []

  const inStock =
    productVariants.length === 0 ||
    productVariants.some((variant) => {
      if (!variant.manage_inventory || variant.allow_backorder) {
        return true
      }

      return (variant.inventory_quantity ?? 0) > 0
    })

  const primaryTag = (product.tags?.[0] as { value?: string } | undefined)
    ?.value
  const seriesLabel = primaryTag ?? product.collection?.title ?? "Catalog Item"
  const sku = productVariants.find((variant) => variant.sku)?.sku

  return (
    <section id="product-info" className="rounded-2xl bg-white p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-[#f3f3f6] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#5b4040]">
            {seriesLabel}
          </span>
          <span
            className={clx(
              "px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]",
              {
                "bg-[#e8f6ec] text-[#17763d]": inStock,
                "bg-[#fff1dc] text-[#9a5d00]": !inStock,
              }
            )}
          >
            {inStock ? "In Stock" : "Lead Time"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5b4040]">
          <span>SKU: {sku ?? product.handle?.toUpperCase() ?? "N/A"}</span>
          <span className="h-1 w-1 rounded-full bg-[#c41e3a]" />
          <span>{productVariants.length} Variant(s)</span>
        </div>

        {product.collection && product.collection.handle && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9e0027] transition-colors hover:text-[#7c001f]"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}

        <Heading
          level="h2"
          className="text-4xl font-black uppercase leading-[0.92] tracking-tight text-[#1a1c1e] small:text-5xl"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-base font-medium leading-relaxed text-[#5b4040] whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description?.trim() ||
            "Engineered for industrial reliability with precision-grade performance and long-term serviceability."}
        </Text>

        {product.tags && product.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {product.tags.slice(0, 4).map((tag) => {
              const value = (tag as { value?: string }).value

              if (!value) {
                return null
              }

              return (
                <li
                  key={`${tag.id}-${value}`}
                  className="bg-[#f3f3f6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5b4040]"
                >
                  {value}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default ProductInfo
