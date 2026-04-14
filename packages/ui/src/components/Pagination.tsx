"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl,
  className,
}) => {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl
    return `${baseUrl}/${page}`
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = []
    const delta = 2

    pages.push(1)

    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)

    if (start > 2) pages.push("...")

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages - 1) pages.push("...")

    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <a
          href={getPageUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 h-10 px-3 rounded-[var(--radius-md)] text-[var(--text-sm)] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-[var(--transition-fast)]"
          aria-label="Go to previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Prev
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 h-10 px-3 text-[var(--text-sm)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Prev
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="h-10 w-10 flex items-center justify-center text-[var(--text-tertiary)]"
            >
              …
            </span>
          ) : (
            <a
              key={page}
              href={getPageUrl(page)}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--text-sm)] font-medium transition-all duration-[var(--transition-fast)]",
                page === currentPage
                  ? "bg-[var(--color-brand-600)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
              )}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </a>
          ),
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <a
          href={getPageUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 h-10 px-3 rounded-[var(--radius-md)] text-[var(--text-sm)] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-[var(--transition-fast)]"
          aria-label="Go to next page"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 h-10 px-3 text-[var(--text-sm)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50">
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      )}
    </nav>
  )
}
