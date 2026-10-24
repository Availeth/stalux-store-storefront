import { HttpTypes } from "@medusajs/types"

export const engineeringFilters = [
  { key: "voltage", value: "24v-dc", label: "24V DC" },
  { key: "voltage", value: "230v-ac", label: "230V AC" },
  { key: "voltage", value: "480v-ac", label: "480V AC" },
  { key: "ip", value: "ip20", label: "IP20" },
  { key: "ip", value: "ip65", label: "IP65" },
  { key: "ip", value: "ip67", label: "IP67" },
] as const

export type CatalogFilters = {
  category?: string
  voltage?: "24v-dc" | "230v-ac" | "480v-ac"
  ip?: "ip20" | "ip65" | "ip67"
  inStock?: boolean
}

type SearchValue = string | string[] | undefined

export const parseCatalogFilters = (params: {
  category?: SearchValue
  voltage?: SearchValue
  ip?: SearchValue
  in_stock?: SearchValue
}): CatalogFilters => {
  const first = (value: SearchValue) =>
    (Array.isArray(value) ? value[0] : value)?.trim()
  const voltage = first(params.voltage)
  const ip = first(params.ip)

  return {
    category: first(params.category) || undefined,
    voltage: engineeringFilters.find(
      (filter) => filter.key === "voltage" && filter.value === voltage
    )?.value as CatalogFilters["voltage"],
    ip: engineeringFilters.find(
      (filter) => filter.key === "ip" && filter.value === ip
    )?.value as CatalogFilters["ip"],
    inStock: first(params.in_stock) === "true",
  }
}

export const isProductInStock = (product: HttpTypes.StoreProduct) =>
  (product.variants ?? []).some(
    (variant) =>
      variant.manage_inventory === false ||
      (typeof variant.inventory_quantity === "number" &&
        variant.inventory_quantity > 0)
  )

const specificationText = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number")
    return String(value)
  if (Array.isArray(value)) return value.map(specificationText).join(" ")
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, entry]) => `${key} ${specificationText(entry)}`)
      .join(" ")
  }
  return ""
}

export const productMatchesCatalogFilters = (
  product: HttpTypes.StoreProduct,
  filters: CatalogFilters
) => {
  if (filters.inStock && !isProductInStock(product)) return false
  if (!filters.voltage && !filters.ip) return true

  const text = specificationText([
    product.title,
    product.subtitle,
    product.description,
    product.metadata,
    product.tags?.map((tag) => tag.value),
    product.variants?.map((variant) => [
      variant.title,
      variant.sku,
      variant.metadata,
      variant.options?.map((option) => option.value),
    ]),
  ])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")

  if (filters.voltage) {
    const [voltage, current] = filters.voltage.split("-")
    const amount = voltage.slice(0, -1)
    const pattern = new RegExp(
      `\\b${amount}\\s*(?:v|volts?)\\s*${current[0]}\\s*${current[1]}\\b`
    )
    if (!pattern.test(text)) return false
  }

  if (filters.ip) {
    const rating = filters.ip.slice(2)
    if (
      !new RegExp(`\\bip(?:\\s*(?:rating|protection))?\\s*${rating}\\b`).test(
        text
      )
    ) {
      return false
    }
  }

  return true
}
