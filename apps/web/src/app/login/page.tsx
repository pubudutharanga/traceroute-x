"use client"

import React, { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

const BACKGROUND_IMAGES = [
  "/bg1.webp",
  "/bg2.webp",
];

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirectTo") || "/admin/dashboard"
  const errorParam = searchParams.get("error")

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(errorParam || "")
  const [mounted, setMounted] = useState(false)

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Background slideshow interval
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
    }, 6000)

    return () => clearInterval(intervalId)
  }, [])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid username or password")
      } else {
        window.location.href = callbackUrl
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg-primary)]">

      {/* Left Panel: Branded & Animated Slideshow (Hidden on mobile) */}
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[var(--color-brand-800)] via-[var(--color-brand-900)] to-[var(--color-brand-950)]">

        {/* Slideshow Background Images */}
        {BACKGROUND_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none 
              ${index === currentSlide ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Background technology"
              className="object-cover w-full h-full"
            />
          </div>
        ))}

        {/* Background Grid & Orbs */}
        <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none"></div>

        <div
          className="absolute rounded-full pointer-events-none blur-[80px]"
          style={{
            width: '400px', height: '400px',
            background: 'rgba(99, 102, 241, 0.15)',
            top: '-10%', right: '-10%',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none blur-[80px]"
          style={{
            width: '300px', height: '300px',
            background: 'rgba(6, 182, 212, 0.15)',
            bottom: '-5%', left: '-5%',
            animation: 'float 25s ease-in-out infinite reverse'
          }}
        />

        {/* Top Logo content */}
        <div className="relative z-10 w-full mb-8">
          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                TraceRoute <span className="text-[var(--color-accent-400)]">X</span>
              </span>
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-[#a5b4fc] uppercase mt-0.5 opacity-90">
                Digital Nexus
              </span>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 w-full max-w-lg mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-semibold mb-6 tracking-wide uppercase backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-400)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-500)]"></span>
            </span>
            Tech Portal
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-sm">
            Explore the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-300)] to-[var(--color-accent-400)]">
              future of tech.
            </span>
          </h1>

          <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-md">
            Your destination for cutting-edge technical news, in-depth gadget reviews, and comprehensive software insights.
          </p>

          {/* Floating Category Pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "AI Breakthroughs", delay: "0s" },
              { label: "Software Engineering", delay: "0.5s" },
              { label: "Gadget Reviews", delay: "1s" },
              { label: "Cloud Arch", delay: "1.5s" }
            ].map((pill, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-full bg-[var(--bg-elevated)]/10 border border-white/10 text-white/90 text-sm font-medium backdrop-blur-md shadow-sm"
                style={{
                  animation: `float-pill 6s ease-in-out infinite`,
                  animationDelay: pill.delay
                }}
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 mt-12 flex items-center gap-4">
          <p className="text-[#c7d2fe] text-sm font-light italic tracking-wide max-w-[280px] text-left drop-shadow-sm">
            "Navigating the intersection of <span className="font-semibold text-white">code</span>, <span className="font-semibold text-white">creation</span>, and <span className="font-semibold text-[var(--color-accent-400)]">the future</span>."
          </p>
          <div className="h-px bg-gradient-to-r from-white/30 to-transparent flex-1"></div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in-up">

          {/* Mobile Header (Only shows on lg breakpoints) */}
          <div className="text-center space-y-3 lg:hidden mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">
              TraceRoute <span className="text-[var(--color-brand-600)]">X</span>
            </h1>
            <p className="text-[var(--text-secondary)] font-medium text-sm tracking-wide uppercase">Authentication Portal</p>
          </div>

          <div className="hidden lg:block text-left mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="text-[var(--text-secondary)] mt-2">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div
              className="p-4 rounded-xl bg-[var(--surface-error)] border border-[var(--text-error)]/20 text-[var(--text-error)] text-sm font-medium flex items-center gap-3 animate-fade-in"
              role="alert"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Glassmorphism Form Card */}
          <div className="bg-[var(--bg-elevated)]/70 backdrop-blur-xl rounded-2xl border border-[var(--border-primary)] p-6 sm:p-8 shadow-xl shadow-[var(--color-brand-900)]/5 relative overflow-hidden">

            <div className="space-y-3">
              <button
                onClick={() => signIn("google", { redirectTo: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4321" })}
                className="group relative w-full h-12 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold hover:border-[var(--border-focus)] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[var(--color-brand-50)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg className="h-5 w-5 relative z-10" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="relative z-10">Continue with Google</span>
              </button>

              <button
                onClick={() => signIn("github", { redirectTo: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4321" })}
                className="group relative w-full h-12 rounded-xl bg-[#24292f] hover:bg-[#1b1f24] text-white font-semibold transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-md"
              >
                <svg className="h-5 w-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="relative z-10">Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-secondary)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--bg-elevated)] px-4 text-[var(--text-tertiary)] font-bold tracking-wider uppercase">
                  Author / Admin Log In
                </span>
              </div>
            </div>

            {/* Credentials form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-username"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent transition-all shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--text-tertiary)]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent transition-all shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--text-tertiary)]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="relative w-full h-12 rounded-xl text-white font-bold bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-accent-600)] hover:from-[var(--color-brand-500)] hover:to-[var(--color-accent-500)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-[var(--color-brand-500)]/25 flex items-center justify-center gap-2 overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>

                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm font-medium text-[var(--text-tertiary)] px-4">
            Readers should use Google or GitHub to sign in. Username access is restricted to administrative staff.
          </p>

        </div>
      </div>
    </div>
  )
}
