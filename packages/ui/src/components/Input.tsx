"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", ...props }, ref) => {
    const inputId = id || React.useId()

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full h-10 px-3 rounded-[var(--radius-md)]",
            "bg-[var(--bg-primary)] text-[var(--text-primary)]",
            "border border-[var(--border-primary)]",
            "placeholder:text-[var(--text-tertiary)]",
            "transition-colors duration-[var(--transition-fast)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-[var(--text-xs)] text-[var(--text-error)]" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[var(--text-xs)] text-[var(--text-tertiary)]">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

// ---- Textarea ----

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || React.useId()

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full min-h-[80px] px-3 py-2 rounded-[var(--radius-md)]",
            "bg-[var(--bg-primary)] text-[var(--text-primary)]",
            "border border-[var(--border-primary)]",
            "placeholder:text-[var(--text-tertiary)]",
            "transition-colors duration-[var(--transition-fast)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-y",
            error && "border-red-500 focus:ring-red-500",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-[var(--text-xs)] text-[var(--text-error)]" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-[var(--text-xs)] text-[var(--text-tertiary)]">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = "Textarea"
