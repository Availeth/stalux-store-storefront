import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-[#f9f9fc] pb-20">
      <div
        className="content-container py-8 small:py-12"
        data-testid="product-container"
      >
        <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#5b4040]">
          <LocalizedClientLink
            href="/store"
            className="transition-colors hover:text-[#9e0027]"
          >
            Products
          </LocalizedClientLink>
          <span>/</span>
          {product.collection?.handle ? (
            <LocalizedClientLink
              href={`/collections/${product.collection.handle}`}
              className="transition-colors hover:text-[#9e0027]"
            >
              {product.collection.title}
            </LocalizedClientLink>
          ) : (
            <span>Catalog</span>
          )}
          <span>/</span>
          <span className="text-[#9e0027]">{product.title}</span>
        </nav>

        <section className="grid grid-cols-1 gap-8 small:grid-cols-12 small:gap-12">
          <div className="small:col-span-7">
            <ImageGallery images={images} productTitle={product.title} />
          </div>

          <div className="small:col-span-5">
            <div className="flex flex-col gap-8 small:sticky small:top-32">
              <ProductInfo product={product} />
              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                  />
                }
              >
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
              <ProductOnboardingCta />
            </div>
          </div>
        </section>

        <div className="mt-12 small:mt-16">
          <ProductTabs product={product} />
        </div>
      </div>

      <div
        className="content-container mt-16 small:mt-20"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
