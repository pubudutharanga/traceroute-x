export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-2xl animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-400)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-500)]"></span>
          </span>
          System Online
        </div>

        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent">
          TraceRoute X
        </h1>

        <p className="text-lg text-[var(--text-secondary)]">
          Admin & API server for the TraceRoute X technology blog platform.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <a
            href="/login"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[var(--color-brand-600)] text-white font-medium hover:bg-[var(--color-brand-700)] transition-colors shadow-sm"
          >
            Sign In
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="/admin/dashboard"
            className="inline-flex items-center h-11 px-6 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
