"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "glass"
  hoverable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const cardVariants = {
  default: "bg-[var(--bg-elevated)] border border-[var(--border-primary)]",
  elevated: "bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]",
  outline: "bg-transparent border border-[var(--border-primary)]",
  glass: "glass",
}

const cardPadding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hoverable = false,
      padding = "md",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-xl)] transition-all duration-[var(--transition-base)]",
          cardVariants[variant],
          cardPadding[padding],
          hoverable && [
            "hover:shadow-[var(--shadow-lg)] hover:-translate-y-1",
            "hover:border-[var(--color-brand-400)]/30",
            "cursor-pointer",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = "Card"

// Sub-components
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[var(--text-lg)] font-semibold text-[var(--text-primary)] leading-[var(--leading-tight)]",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[var(--text-sm)] text-[var(--text-secondary)]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-[var(--border-primary)]", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"
