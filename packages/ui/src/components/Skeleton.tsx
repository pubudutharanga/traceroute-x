"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}) => {
  return (
    <div
      className={cn(
        "skeleton animate-pulse",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded-[var(--radius-sm)] h-4",
        variant === "rectangular" && "rounded-[var(--radius-md)]",
        className,
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

// Pre-built skeleton layouts
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton height={200} className="w-full" />
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" />
    <div className="flex items-center gap-2 pt-2">
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="text" className="w-24" />
    </div>
  </div>
)

export const SkeletonPost: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4 max-w-3xl", className)}>
    <Skeleton variant="text" className="w-3/4 h-8" />
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-1">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
    <Skeleton height={400} className="w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className,
}) => (
  <div className={cn("space-y-3", className)}>
    <div className="flex gap-4">
      <Skeleton variant="text" className="w-1/4 h-5" />
      <Skeleton variant="text" className="w-1/4 h-5" />
      <Skeleton variant="text" className="w-1/4 h-5" />
      <Skeleton variant="text" className="w-1/4 h-5" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
    ))}
  </div>
)
