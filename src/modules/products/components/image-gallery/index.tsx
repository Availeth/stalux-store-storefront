import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle: string
}

const ImageGallery = ({ images, productTitle }: ImageGalleryProps) => {
  const galleryImages = images.filter(
    (
      image
    ): image is HttpTypes.StoreProductImage & {
      url: string
    } => Boolean(image.url)
  )

  if (!galleryImages.length) {
    return (
      <div className="flex min-h-[440px] items-center justify-center rounded-2xl border border-[#e3bebd]/30 bg-[#f3f3f6] p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b4040]">
          Product image not available
        </p>
      </div>
    )
  }

  const [featuredImage, ...thumbnailImages] = galleryImages

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative overflow-hidden rounded-2xl border border-[#e3bebd]/30 bg-[#f3f3f6] p-6 small:p-10">
        <div className="absolute left-5 top-5 flex flex-col gap-2 small:left-7 small:top-7">
          <span className="bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#5b4040] backdrop-blur">
            Precision Module
          </span>
          <span className="bg-[#c41e3a] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
            Industrial Grade
          </span>
        </div>

        <div className="relative aspect-[4/3] w-full">
          <Image
            src={featuredImage.url}
            priority
            className="absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            alt={productTitle}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
      </div>

      {thumbnailImages.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 xsmall:grid-cols-4">
          {thumbnailImages.slice(0, 4).map((image, index) => {
            return (
              <li
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-[#e3bebd]/30 bg-white p-2"
                id={image.id}
              >
                <Image
                  src={image.url}
                  priority={index === 0}
                  className="h-full w-full object-contain"
                  alt={`${productTitle} - image ${index + 2}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 160px"
                  style={{
                    objectFit: "contain",
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ImageGallery
