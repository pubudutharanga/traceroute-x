/**
 * TraceRoute X — Shared UI Components
 * =====================================
 * All components use CSS custom properties from the shared theme
 * and are compatible with both Next.js and Astro (as React islands).
 */

// Utilities
export { cn } from "./lib/utils"

// Components
export { Button, type ButtonProps } from "./components/Button"
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from "./components/Card"
export { Badge, type BadgeProps } from "./components/Badge"
export { Avatar, type AvatarProps } from "./components/Avatar"
export { Input, Textarea, type InputProps, type TextareaProps } from "./components/Input"
export {
  Skeleton,
  SkeletonCard,
  SkeletonPost,
  SkeletonTable,
  type SkeletonProps,
} from "./components/Skeleton"
export { ThemeToggle, useTheme, type ThemeToggleProps } from "./components/ThemeToggle"
export { Pagination, type PaginationProps } from "./components/Pagination"
export { LikeButton, type LikeButtonProps } from "./components/LikeButton"
export { CommentSection, type CommentSectionProps } from "./components/CommentSection"
export { ShareButtons, type ShareButtonsProps } from "./components/ShareButtons"
