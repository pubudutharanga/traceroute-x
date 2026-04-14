"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "success" | "warning" | "error" | "outline"
  size?: "sm" | "md"
}

const badgeVariants = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  brand: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-950)] dark:text-[var(--color-brand-300)]",
  success: "bg-[var(--surface-success)] text-[var(--text-success)]",
  warning: "bg-[var(--surface-warning)] text-[var(--text-warning)]",
  error: "bg-[var(--surface-error)] text-[var(--text-error)]",
  outline: "bg-transparent border border-[var(--border-primary)] text-[var(--text-secondary)]",
}

const badgeSizes = {
  sm: "px-2 py-0.5 text-[0.6875rem]",
  md: "px-2.5 py-1 text-[var(--text-xs)]",
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-[var(--radius-full)] whitespace-nowrap transition-colors duration-[var(--transition-fast)]",
          badgeVariants[variant],
          badgeSizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Badge.displayName = "Badge"
