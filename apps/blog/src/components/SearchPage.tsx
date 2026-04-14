"use client"

import React from "react"
import Fuse from "fuse.js"

interface SearchItem {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
  readingTime: number
  coverImage: string
  coverAlt: string
}

interface SearchPageProps {
  searchIndex: SearchItem[]
}

export const SearchPage: React.FC<SearchPageProps> = ({ searchIndex }) => {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchItem[]>([])
  const [hasSearched, setHasSearched] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const fuse = React.useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "description", weight: 0.2 },
          { name: "category", weight: 0.15 },
          { name: "tags", weight: 0.15 },
          { name: "author", weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [searchIndex],
  )

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        const searchResults = fuse.search(query.trim())
        setResults(searchResults.map((r) => r.item))
        setHasSearched(true)
      } else {
        setResults([])
        setHasSearched(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, fuse])

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] text-lg placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent transition-all shadow-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
        {hasSearched && (
          <p className="text-sm text-[var(--text-tertiary)] mt-3 text-center">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </p>
        )}
      </div>

      {/* Results */}
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-[var(--text-secondary)]">
            Start typing to search through all articles
          </p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">
            Search by title, description, category, tag, or author
          </p>
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-[var(--text-secondary)]">
            No articles found matching "{query}"
          </p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">
            Try different keywords or browse{" "}
            <a href="/blog" className="text-[var(--text-link)] hover:underline">
              all articles
            </a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((post, i) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-elevated)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.coverAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width={400}
                height={225}
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-xs font-medium text-[var(--text-secondary)]">
                  {post.category}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {post.readingTime} min read
                </span>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-link)] transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                {post.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
