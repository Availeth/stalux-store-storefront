"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  variant = "default",
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  variant?: "default" | "catalog"
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx({
        "txt-xlarge-plus text-ui-fg-muted text-ui-fg-base hover:text-ui-fg-subtle":
          variant === "default" && isCurrent,
        "txt-xlarge-plus text-ui-fg-muted": variant === "default" && !isCurrent,
        "inline-flex min-h-9 min-w-9 items-center justify-center border text-[11px] font-bold uppercase tracking-[0.14em]":
          variant === "catalog",
        "border-[#a51634] bg-[#a51634] text-white":
          variant === "catalog" && isCurrent,
        "border-[#d2dae6] bg-white text-[#516177] hover:border-[#a51634] hover:text-[#a51634]":
          variant === "catalog" && !isCurrent,
      })}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className={clx("items-center cursor-default", {
        "txt-xlarge-plus text-ui-fg-muted": variant === "default",
        "px-1 text-sm font-bold text-[#8a97a9]": variant === "catalog",
      })}
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  // Render the component
  return (
    <div
      className={clx("w-full", {
        "mt-12 flex justify-center": variant === "default",
        "mt-10 flex justify-end": variant === "catalog",
      })}
    >
      <div
        className={clx("flex items-end", {
          "gap-3": variant === "default",
          "gap-2": variant === "catalog",
        })}
        data-testid={dataTestid}
      >
        {renderPageButtons()}
      </div>
    </div>
  )
}
