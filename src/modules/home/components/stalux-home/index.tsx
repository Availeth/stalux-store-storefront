import { ShoppingCart } from "@medusajs/icons"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import Link from "next/link"

type StaluxHomeProps = {
  countryCode: string
  featuredProducts: HttpTypes.StoreProduct[]
}

const categoryLinks = [
  { label: "AC Drives", href: "/store" },
  { label: "Servo Drives", href: "/store" },
  { label: "PLCs", href: "/store" },
  { label: "HMIs", href: "/store" },
  { label: "Sensors", href: "/store" },
]


const withCountryCode = (countryCode: string, path: string) =>
  `/${countryCode}${path}`

const getInventoryStatus = (
  product: HttpTypes.StoreProduct
): "In Stock" | "Low Stock" | "Out of Stock" | null => {
  const variants = product.variants || []
  const inventories = variants
    .map((variant) =>
      typeof variant?.inventory_quantity === "number"
        ? variant.inventory_quantity
        : null
    )
    .filter((quantity): quantity is number => quantity !== null)

  if (!inventories.length) {
    return null
  }

  const totalInventory = inventories.reduce((sum, value) => sum + value, 0)

  if (totalInventory <= 0) {
    return "Out of Stock"
  }

  if (totalInventory <= 5) {
    return "Low Stock"
  }

  return "In Stock"
}

const getProductBadge = (product: HttpTypes.StoreProduct) => {
  const tagName = product.tags?.[0]?.value || product.tags?.[0]?.name
  return tagName || product.subtitle || "Stalux Component"
}

const getProductSku = (product: HttpTypes.StoreProduct) => {
  const sku = product.variants?.[0]?.sku
  return sku || "N/A"
}

export default function StaluxHome({
  countryCode,
  featuredProducts,
}: StaluxHomeProps) {
  return (
    <main className="bg-[#f9f9fc] text-[#1a1c1e] pb-20">
      <div className="content-container py-8 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-36 rounded-xl bg-white p-6 shadow-[0_20px_60px_rgba(26,28,30,0.06)]">
              <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-[#c41e3a]">
                Categories
              </h2>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#5b4040]">
                Precision Components
              </p>
              <ul className="mt-6 space-y-2">
                {categoryLinks.map((category, index) => {
                  const isPrimary = index === 0

                  return (
                    <li key={category.label}>
                      <Link
                        href={withCountryCode(countryCode, category.href)}
                        className={`block rounded-md px-4 py-3 text-sm font-semibold tracking-tight transition ${
                          isPrimary
                            ? "bg-[#f3f3f6] text-[#c41e3a]"
                            : "text-[#5b4040] hover:bg-[#f3f3f6] hover:text-[#c41e3a]"
                        }`}
                      >
                        {category.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>

          <div className="space-y-16 md:space-y-24">
            <section className="relative overflow-hidden rounded-2xl bg-[#f9f9fc]">
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <span className="inline-block bg-[#c41e3a] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                    Industrial Excellence
                  </span>
                  <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-tight text-[#1a1c1e] md:text-7xl">
                    TORQUED TO <span className="text-[#c41e3a]">SPEC.</span>
                  </h1>
                  <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-[#5b4040]">
                    High-performance motion control systems engineered for
                    continuous industrial reliability.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={withCountryCode(countryCode, "/store")}
                      className="inline-flex items-center gap-2 rounded-md bg-gradient-to-br from-[#9e0027] to-[#c41e3a] px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_40px_rgba(158,0,39,0.28)] transition hover:brightness-110"
                    >
                      Explore Catalog
                      <span aria-hidden>→</span>
                    </Link>
                    <Link
                      href={withCountryCode(countryCode, "/store")}
                      className="inline-flex items-center rounded-md bg-[#e2e2e5] px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#1a1c1e] transition hover:bg-[#dadadc]"
                    >
                      Technical Data
                    </Link>
                  </div>
                </div>

                <div className="relative lg:col-span-7">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJlzCaSaYHsKZzgoneXYAJykk0pGT-NIR8i7oFTn35j3o_FJU6L3UwOV-WeQyciSQ-UoiEoiG1xUFiW9ifWmniNMHaPgLDpz58xCM5EhzWQ_rfHJFB89MdR0GIB7_F22LeKVdJRvkOLZLwNeg9orAFWnAT_oXLuGDe2q6XcAQ3wowInxhZPUgGaj-9dXl31E-BfKe1I8p7AFPaneRB5noiiiLi60K0TXjntboErqjbb626pxFWfVkeZmrOwaN3Ednao9Lpi1bPWGp_"
                      alt="High-tech automated assembly line in a precision industrial facility."
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f9f9fc]/45 to-transparent" />
                  </div>
                  <div className="mt-5 rounded-xl bg-white p-6 shadow-[0_24px_50px_rgba(26,28,30,0.1)] lg:absolute lg:-bottom-10 lg:-left-10 lg:mt-0 lg:max-w-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="text-xl font-black tracking-tight text-[#c41e3a]">
                        S-SERIES 500
                      </span>
                      <span className="bg-[#e8e8ea] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                        In Stock
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b4040]">
                      High Torque Servo Drive
                    </p>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-[#5b4040]">
                      Optimized for high-speed pick-and-place deployments with
                      integrated STO safety.
                    </p>
                    <Link
                      href={withCountryCode(countryCode, "/store")}
                      className="mt-5 inline-flex border-b border-[#c41e3a] pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c41e3a] transition hover:text-[#9e0027]"
                    >
                      Configure Now
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-[#f3f3f6] p-6 md:p-10">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-[#1a1c1e] md:text-4xl">
                    Core Infrastructure
                  </h2>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5b4040]">
                    Specialized Automation Modules
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <article className="group relative overflow-hidden rounded-xl bg-white p-8 transition hover:bg-[#e8e8ea] md:col-span-2 md:row-span-2">
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-4xl font-black uppercase leading-none tracking-tight text-[#1a1c1e] md:text-5xl">
                        AC <br />
                        Drives
                      </h3>
                      <p className="mt-4 max-w-xs text-sm text-[#5b4040]">
                        Versatile frequency inverters for standard applications
                        and complex process control.
                      </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      <span className="bg-[#e8e8ea] px-2 py-1 text-[10px] font-bold uppercase tracking-tight">
                        0.75kW - 630kW
                      </span>
                      <span className="bg-[#e8e8ea] px-2 py-1 text-[10px] font-bold uppercase tracking-tight">
                        EtherNet/IP
                      </span>
                      <span className="bg-[#e8e8ea] px-2 py-1 text-[10px] font-bold uppercase tracking-tight">
                        IP66 Options
                      </span>
                    </div>
                    <Link
                      href={withCountryCode(countryCode, "/store")}
                      className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#c41e3a] transition group-hover:gap-3"
                    >
                      View Series <span aria-hidden>→</span>
                    </Link>
                  </div>
                  <span className="pointer-events-none absolute -bottom-12 -right-8 text-[9rem] font-black text-[#e8e8ea] transition group-hover:text-[#c41e3a]/15">
                    AC
                  </span>
                </article>

                <article className="rounded-xl bg-white p-8 transition hover:bg-[#e8e8ea]">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-[#1a1c1e]">
                    Servo Drives
                  </h4>
                  <p className="mt-3 text-sm text-[#5b4040]">
                    High-dynamic response for precision positioning.
                  </p>
                  <Link
                    href={withCountryCode(countryCode, "/store")}
                    className="mt-7 inline-flex text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1c1e] transition hover:text-[#c41e3a]"
                  >
                    Browse Range
                  </Link>
                </article>

                <article className="rounded-xl bg-white p-8 transition hover:bg-[#e8e8ea]">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-[#1a1c1e]">
                    Motion Control
                  </h4>
                  <p className="mt-3 text-sm text-[#5b4040]">
                    Multi-axis synchronization for advanced robotics.
                  </p>
                  <Link
                    href={withCountryCode(countryCode, "/store")}
                    className="mt-7 inline-flex text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1c1e] transition hover:text-[#c41e3a]"
                  >
                    Browse Range
                  </Link>
                </article>

                <article className="rounded-xl bg-[#1a1c1e] p-8 text-white md:col-span-2">
                  <h4 className="text-3xl font-black uppercase tracking-tight">
                    Soft Starters
                  </h4>
                  <p className="mt-3 max-w-md text-sm text-[#f0f0f3]">
                    Reduced mechanical stress and electrical surges during motor
                    startup.
                  </p>
                  <Link
                    href={withCountryCode(countryCode, "/store")}
                    className="mt-8 inline-flex rounded-md bg-[#c41e3a] px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#9e0027]"
                  >
                    Shop Specials
                  </Link>
                </article>
              </div>
            </section>

            <section className="rounded-2xl bg-[#f9f9fc]">
              <div className="mb-10 flex items-center gap-4">
                <span className="h-px w-12 bg-[#c41e3a]" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c41e3a]">
                  Featured Components
                </h2>
              </div>

              {featuredProducts.length > 0 ? (
                <div className="grid gap-[1px] overflow-hidden rounded-xl bg-[#e3bebd]/30 sm:grid-cols-2 xl:grid-cols-4">
                  {featuredProducts.map((product) => {
                    const image = product.thumbnail || product.images?.[0]?.url
                    const productStatus = getInventoryStatus(product)
                    const price = getProductPrice({ product }).cheapestPrice
                    const stockStyles =
                      productStatus === "Low Stock"
                        ? "bg-[#ffdad6] text-[#93000a]"
                        : productStatus === "Out of Stock"
                          ? "bg-[#1a1c1e] text-white"
                          : "bg-[#e8e8ea] text-[#1a1c1e]"
                    const productHref = product.handle
                      ? withCountryCode(
                          countryCode,
                          `/products/${product.handle}`
                        )
                      : withCountryCode(countryCode, "/store")

                    return (
                      <article
                        key={product.id}
                        className="flex h-full flex-col bg-white p-6 md:p-8"
                      >
                        <div className="relative mb-6 aspect-square">
                          {image ? (
                            <img
                              src={image}
                              alt={product.title}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <div className="h-full w-full rounded-lg bg-[#f3f3f6]" />
                          )}
                          {productStatus && (
                            <span
                              className={`absolute right-0 top-0 px-2 py-1 text-[9px] font-black uppercase tracking-wider ${stockStyles}`}
                            >
                              {productStatus}
                            </span>
                          )}
                        </div>

                        <div className="flex grow flex-col">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5b4040]">
                            {getProductBadge(product)}
                          </p>
                          <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-[#1a1c1e]">
                            {product.title}
                          </h3>

                          <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#e3bebd]/20 py-4">
                            <div>
                              <span className="block text-[9px] uppercase tracking-tight text-[#5b4040]">
                                Variants
                              </span>
                              <span className="text-xs font-bold uppercase">
                                {product.variants?.length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase tracking-tight text-[#5b4040]">
                                SKU
                              </span>
                              <span className="text-xs font-bold uppercase">
                                {getProductSku(product)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 flex items-end justify-between">
                            <div>
                              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#5b4040]">
                                Unit Price
                              </span>
                              <span className="text-2xl font-black tracking-tight text-[#1a1c1e]">
                                {price?.calculated_price || "Contact Sales"}
                              </span>
                            </div>
                            <Link
                              href={productHref}
                              className="inline-flex h-11 w-11 items-center justify-center bg-[#1a1c1e] text-white transition hover:bg-[#c41e3a]"
                              aria-label={`Shop ${product.title}`}
                            >
                              <ShoppingCart className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-white p-8">
                  <p className="text-sm font-medium text-[#5b4040]">
                    No featured products are available in the current region.
                  </p>
                  <Link
                    href={withCountryCode(countryCode, "/store")}
                    className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.2em] text-[#c41e3a] transition hover:text-[#9e0027]"
                  >
                    Browse Catalog
                  </Link>
                </div>
              )}
            </section>

            <section className="relative overflow-hidden rounded-2xl bg-[#c41e3a] p-8 text-white md:p-12">
              <div className="relative z-10 grid gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl">
                    Custom System <br />
                    Integration?
                  </h2>
                  <p className="mt-6 max-w-xl text-base text-[#ffdada]">
                    Our engineering team provides full documentation and CAD
                    files for seamless deployment into existing infrastructure.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={withCountryCode(countryCode, "/account")}
                      className="inline-flex rounded-md bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#c41e3a] transition hover:bg-[#f3f3f6]"
                    >
                      Request Quote
                    </Link>
                    <Link
                      href={withCountryCode(countryCode, "/account")}
                      className="inline-flex rounded-md border border-white/30 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                    >
                      Technical Support
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <article className="rounded-md border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                      Technical Docs
                    </h3>
                    <p className="mt-3 text-[11px] uppercase leading-relaxed tracking-tight text-[#ffdada]">
                      Full schematic libraries available for V-Series and
                      S-Series units.
                    </p>
                  </article>
                  <article className="rounded-md border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                      3D CAD Files
                    </h3>
                    <p className="mt-3 text-[11px] uppercase leading-relaxed tracking-tight text-[#ffdada]">
                      Downloadable STEP and SolidWorks models for rapid
                      prototyping.
                    </p>
                  </article>
                </div>
              </div>

              <span className="pointer-events-none absolute -right-10 -top-20 text-[14rem] font-black text-[#920023]/20 md:text-[20rem]">
                STALUX
              </span>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
