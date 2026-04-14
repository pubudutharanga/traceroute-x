"use client"

import React from "react"
import { cn } from "../lib/utils"

// ---- Button Variants ----
const buttonVariants = {
  variant: {
    primary:
      "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] active:bg-[var(--color-brand-800)] shadow-sm",
    secondary:
      "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] border border-[var(--border-primary)]",
    ghost:
      "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    outline:
      "border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
    link: "text-[var(--text-link)] hover:text-[var(--text-link-hover)] underline-offset-4 hover:underline p-0 h-auto",
  },
  size: {
    sm: "h-8 px-3 text-[var(--text-sm)] rounded-[var(--radius-md)]",
    md: "h-10 px-4 text-[var(--text-sm)] rounded-[var(--radius-md)]",
    lg: "h-12 px-6 text-[var(--text-base)] rounded-[var(--radius-lg)]",
    icon: "h-10 w-10 rounded-[var(--radius-md)]",
  },
} as const

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-[var(--transition-fast)] focus-ring cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          isLoading && "opacity-70 pointer-events-none",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"
