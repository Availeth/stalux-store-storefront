import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { getProductPrice } from "@lib/util/get-product-price"

const formatMetadataKey = (key: string) => {
  return key
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getMetadataSpecifications = (product: HttpTypes.StoreProduct) => {
  const metadata = product.metadata ?? {}

  return Object.entries(metadata)
    .filter(([, value]) => {
      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      )
    })
    .slice(0, 2)
    .map(([key, value]) => `${formatMetadataKey(key)}: ${String(value)}`)
}

const getSpecificationLines = (product: HttpTypes.StoreProduct) => {
  const specs = getMetadataSpecifications(product)

  if (specs.length < 2) {
    const variantTitle = product.variants?.[0]?.title

    if (variantTitle && variantTitle !== "Default Variant") {
      specs.push(variantTitle)
    }
  }

  if (specs.length < 2) {
    const sku = product.variants?.[0]?.sku

    if (sku) {
      specs.push(`SKU: ${sku}`)
    }
  }

  if (specs.length < 2) {
    specs.push(`Variants: ${product.variants?.length ?? 0}`)
  }

  if (specs.length < 2) {
    specs.push("Industrial-grade component")
  }

  return specs.slice(0, 2)
}

const getInventoryState = (product: HttpTypes.StoreProduct) => {
  const inventoryValues = (product.variants ?? [])
    .map((variant) => variant.inventory_quantity)
    .filter((quantity): quantity is number => typeof quantity === "number")

  if (inventoryValues.length === 0) {
    return {
      label: "In Stock",
      className: "bg-[#e8f6ec] text-[#17763d]",
    }
  }

  const hasInventory = inventoryValues.some((quantity) => quantity > 0)

  if (hasInventory) {
    return {
      label: "In Stock",
      className: "bg-[#e8f6ec] text-[#17763d]",
    }
  }

  return {
    label: "Lead Time",
    className: "bg-[#fff1dc] text-[#9a5d00]",
  }
}

const getSeriesLabel = (product: HttpTypes.StoreProduct) => {
  const tagLabel = (product.tags?.[0] as { value?: string } | undefined)?.value

  if (tagLabel) {
    return tagLabel
  }

  const handlePrefix = product.handle?.split("-")?.[0]

  if (handlePrefix) {
    return `${handlePrefix.toUpperCase()} Series`
  }

  return "Catalog Item"
}

export default function CatalogProductCard({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const specificationLines = getSpecificationLines(product)
  const inventoryState = getInventoryState(product)
  const seriesLabel = getSeriesLabel(product)
  const productImage = product.thumbnail || product.images?.[0]?.url

  if (!product.handle) {
    return null
  }

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <article
        className="h-full border border-[#dde3eb] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-28px_rgba(19,35,63,0.45)]"
        data-testid="product-wrapper"
      >
        <div className="relative aspect-square overflow-hidden bg-[#f4f6fa] p-8">
          {productImage ? (
            <Image
              src={productImage}
              alt={product.title}
              width={520}
              height={520}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#9aa7b8]">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9aa7b8]">
              {seriesLabel}
            </span>
            <span
              className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${inventoryState.className}`}
            >
              {inventoryState.label}
            </span>
          </div>

          <h3 className="mb-4 min-h-[3.2rem] text-base font-bold uppercase leading-tight tracking-[0.02em] text-[#1a1f28]">
            {product.title}
          </h3>

          <div className="mb-5 space-y-1 bg-[#f1f4f8] p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a97a9]">
              Specifications
            </p>
            {specificationLines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="text-xs font-medium text-[#4c5a71]"
              >
                {line}
              </p>
            ))}
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              {cheapestPrice?.price_type === "sale" && (
                <span className="text-xs text-[#8d98ab] line-through">
                  {cheapestPrice.original_price}
                </span>
              )}
              <span className="text-xl font-black tracking-[-0.01em] text-[#1a1f28]">
                {cheapestPrice?.calculated_price || "Price on request"}
              </span>
            </div>
            <span className="inline-flex bg-[#a51634] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-200 group-hover:bg-[#870f29]">
              View Product
            </span>
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
