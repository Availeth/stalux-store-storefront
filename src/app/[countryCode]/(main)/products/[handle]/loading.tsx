export default function LoadingProduct() {
  return (
    <div
      className="bg-[#f9f9fc] pb-20"
      role="status"
      aria-label="Loading product"
    >
      <span className="sr-only">Loading product…</span>
      <div
        className="content-container animate-pulse py-8 small:py-12"
        aria-hidden="true"
      >
        <div className="mb-8 h-4 w-64 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-8 small:grid-cols-12 small:gap-12">
          <div className="aspect-[4/3] rounded-2xl bg-gray-200 small:col-span-7" />
          <div className="space-y-8 small:col-span-5">
            <div className="h-64 rounded-2xl bg-white" />
            <div className="h-48 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
