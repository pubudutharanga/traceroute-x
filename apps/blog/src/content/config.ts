/**
 * Astro Content Collections Configuration
 * Defines the schema for MDX blog post frontmatter
 */

import { defineCollection, z } from "astro:content"

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().max(100),
    description: z.string().min(80).max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string(),
    category: z.string(),
    tags: z.array(z.string()).min(1).max(8),
    coverImage: z.string(),
    coverAlt: z.string(),
    readingTime: z.number().min(1),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    review: z.object({
      rating: z.number().min(0).max(5),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      verdict: z.string(),
      price: z.string().optional(),
    }).optional(),
  }),
})

export const collections = { posts }
