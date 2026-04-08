import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

type SpecEntry = {
  label: string
  value: string
}

const formatMetadataKey = (key: string) => {
  return key
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

const stringOrNull = (value: unknown) => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
  }

  return null
}

const extractMetadataValue = (
  metadata: Record<string, unknown>,
  keys: string[]
) => {
  for (const key of keys) {
    const value = stringOrNull(metadata[key])

    if (value) {
      return value
    }
  }

  return null
}

const getFileNameFromUrl = (url: string) => {
  try {
    const pathname = new URL(url).pathname
    const fileName = pathname.split("/").pop()

    return fileName ? decodeURIComponent(fileName) : url
  } catch {
    return url
  }
}

const getTechnicalSpecifications = (product: HttpTypes.StoreProduct) => {
  const dimensions =
    product.length && product.width && product.height
      ? `${product.length}L x ${product.width}W x ${product.height}H`
      : null

  const sku = product.variants?.find((variant) => variant.sku)?.sku
  const metadata = (product.metadata ?? {}) as Record<string, unknown>

  const baseSpecs: SpecEntry[] = [
    {
      label: "Material",
      value: product.material ?? "-",
    },
    {
      label: "Country Of Origin",
      value: product.origin_country
        ? product.origin_country.toUpperCase()
        : "Not specified",
    },
    {
      label: "Product Type",
      value: product.type?.value ?? "Not specified",
    },
    {
      label: "Weight",
      value: product.weight ? `${product.weight} g` : "Not specified",
    },
    {
      label: "Dimensions",
      value: dimensions ?? "Not specified",
    },
    {
      label: "Variants",
      value: String(product.variants?.length ?? 0),
    },
    {
      label: "Primary SKU",
      value: sku ?? "Not specified",
    },
  ]

  const metadataSpecs = Object.entries(metadata)
    .filter(([key]) => {
      return ![
        "cad_url",
        "cad_file",
        "step_url",
        "step_file",
        "schematic_url",
        "drawing_url",
        "manual_url",
        "datasheet_url",
        "compliance_url",
        "certificate_url",
      ].includes(key)
    })
    .map(([key, value]) => {
      const parsedValue = stringOrNull(value)

      if (!parsedValue) {
        return null
      }

      return {
        label: formatMetadataKey(key),
        value: parsedValue,
      }
    })
    .filter((entry): entry is SpecEntry => Boolean(entry))

  return [...baseSpecs, ...metadataSpecs].slice(0, 8)
}

const getDownloads = (product: HttpTypes.StoreProduct) => {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>

  const items = [
    {
      label: "3D Dataset",
      value: extractMetadataValue(metadata, [
        "cad_url",
        "cad_file",
        "step_url",
        "step_file",
      ]),
    },
    {
      label: "Schematics",
      value: extractMetadataValue(metadata, [
        "schematic_url",
        "drawing_url",
        "wiring_url",
      ]),
    },
    {
      label: "User Guide",
      value: extractMetadataValue(metadata, [
        "manual_url",
        "datasheet_url",
        "brochure_url",
      ]),
    },
    {
      label: "Compliance",
      value: extractMetadataValue(metadata, [
        "compliance_url",
        "certificate_url",
      ]),
    },
  ]

  return items.map((item) => {
    const fileName = item.value ? getFileNameFromUrl(item.value) : null

    return {
      ...item,
      fileName,
    }
  })
}

const shippingHighlights = [
  {
    title: "Fast Delivery",
    body: "Dispatch in 2-5 business days for stocked variants across supported regions.",
  },
  {
    title: "Simple Exchanges",
    body: "Need a different variant? We process exchange requests through support with minimal downtime.",
  },
  {
    title: "Engineering Support",
    body: "Application engineers are available for sizing, commissioning, and integration guidance.",
  },
]

const ProductTabs = ({ product }: ProductTabsProps) => {
  const technicalSpecifications = getTechnicalSpecifications(product)
  const downloads = getDownloads(product)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 small:grid-cols-12">
        <div className="small:col-span-8 rounded-2xl border border-[#e3bebd]/30 bg-[#f3f3f6] p-6 small:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#e3bebd]/30 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#1a1c1e] small:text-3xl">
              Technical Specifications
            </h2>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5b4040]">
              Product Data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-3 xsmall:grid-cols-2">
            {technicalSpecifications.map((specification) => (
              <div
                key={specification.label}
                className="flex items-center justify-between gap-3 border-b border-[#e3bebd]/25 py-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5b4040]">
                  {specification.label}
                </span>
                <span className="text-sm font-semibold text-[#1a1c1e]">
                  {specification.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="small:col-span-4 rounded-2xl bg-[#1a1c1e] p-6 text-white small:p-8">
          <h3 className="text-xl font-black uppercase tracking-tight">
            Downloads & CAD
          </h3>
          <ul className="mt-5 space-y-3">
            {downloads.map((download) => {
              if (!download.value) {
                return (
                  <li
                    key={download.label}
                    className="flex items-center justify-between bg-white/10 p-4"
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                        {download.label}
                      </p>
                      <p className="text-sm font-semibold">Unavailable</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                      -
                    </span>
                  </li>
                )
              }

              return (
                <li key={download.label}>
                  <a
                    href={download.value}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-white/10 p-4 transition-colors hover:bg-[#c41e3a]"
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                        {download.label}
                      </p>
                      <p className="text-sm font-semibold">
                        {download.fileName ?? "Download File"}
                      </p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      Open
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 small:grid-cols-3">
        {shippingHighlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-xl border border-[#e3bebd]/30 bg-white p-5"
          >
            <h4 className="text-[11px] font-black uppercase tracking-[0.22em] text-[#1a1c1e]">
              {highlight.title}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-[#5b4040]">
              {highlight.body}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default ProductTabs
