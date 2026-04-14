You are building a production-grade, SEO-focused technology blog website targeting a USA audience. Below is the complete specification. Build this incrementally, starting with the project scaffold, then each layer in order.

---

## PROJECT OVERVIEW

Name: [Traceroute X] — a technology blog for US/UK readers
Framework: Next.js 14 (App Router) + Astro 4 (hybrid setup)
Content: MDX files stored in a GitHub repository
Database: PostgreSQL via Prisma ORM
Auth: NextAuth.js v5 (Google OAuth + GitHub OAuth + Credentials provider)
Styling: Tailwind CSS v4/Suitable Modern UI with best UX/Need dark mode and light mode also.
Deployment target: Vercel (Next.js) + Vercel Edge Network

---

## ARCHITECTURE

Use a monorepo structure:
- /apps/web → Next.js App Router (handles auth, API routes, admin dashboard, user profiles, comments, likes)
- /apps/blog → Astro (handles all public blog pages: listing, individual posts, category, tag pages — fully SSG/SSR optimized)
- /packages/db → Prisma schema + generated client (shared)
- /packages/ui → shared Tailwind components
- /packages/config → shared ESLint, Tailwind, TypeScript configs

Both apps share the Prisma database client from the shared package.

---

## CONTENT LAYER (GitHub MDX)

Blog posts live in a GitHub repository in /content/posts/[slug].mdx
Each MDX file has this frontmatter schema:
  - title: string
  - slug: string (URL-safe)
  - description: string (150–160 chars, for meta description)
  - publishedAt: ISO date string
  - updatedAt: ISO date string (for SEO freshness signals)
  - author: string (matches author slug in DB)
  - category: string
  - tags: string[]
  - coverImage: string (URL)
  - coverAlt: string
  - readingTime: number (minutes)
  - featured: boolean
  - draft: boolean

Astro fetches MDX files at build time from the local /content directory (synced from GitHub via git submodule or GitHub Actions). Use Astro's Content Collections API with Zod schema validation on the frontmatter.

---

## DATABASE SCHEMA (PostgreSQL + Prisma)

Create these models:

User {
  id, email, name, avatarUrl, bio, location, website
  provider: enum (GOOGLE, GITHUB, CREDENTIALS)
  role: enum (USER, AUTHOR, SUPER_ADMIN)
  username (unique, nullable)
  passwordHash (nullable — only for CREDENTIALS users)
  createdAt, updatedAt
  comments Comment[]
  likes Like[]
}

Author {
  id
  userId (FK → User, one-to-one)
  displayName, bio, avatarUrl, twitterHandle, githubHandle
  slug (unique)
  createdAt, updatedAt
}

Comment {
  id, postSlug, content
  userId (FK → User)
  parentId (FK → Comment, nullable — for threaded replies)
  isDeleted, deletedAt
  createdAt, updatedAt
}

Like {
  id, postSlug
  userId (FK → User)
  @@unique([postSlug, userId])
  createdAt
}

PostAnalytics {
  id, postSlug (unique), viewCount, uniqueVisitors
  avgReadDepth (Float — scroll %)
  updatedAt
}

PageView {
  id, postSlug, visitorId (anonymous fingerprint), country, referrer, userAgent
  createdAt
}

AdminSession {
  id, userId (FK → User), token, expiresAt, createdAt
}

---

## AUTHENTICATION (NextAuth.js v5)

Configure three providers:
1. Google OAuth — for public readers/commenters
2. GitHub OAuth — for public readers/commenters
3. Credentials — ONLY for Author and Super Admin logins (username + bcrypt password)

Session strategy: JWT with role embedded in token
Middleware: protect /admin/* and /dashboard/* routes — redirect unauthenticated to /login

After OAuth login, auto-create User record if not exists. Set default role as USER.
OAuth users cannot access /admin. Only AUTHOR and SUPER_ADMIN roles can.

---

## ROLE & PERMISSION SYSTEM (RBAC)

Three roles with strict boundaries:

USER (public reader):
  - Can comment on posts (authenticated)
  - Can like/unlike posts
  - Has /profile page showing their comments and liked posts
  - Can edit their own profile (bio, name, avatar)

AUTHOR:
  - Can log in to /admin/dashboard
  - Can view analytics for their own posts (views, likes, comments per post)
  - Can view overall site analytics (read-only)
  - CANNOT create, update, or delete other users
  - CANNOT change any user's username or password
  - CANNOT elevate privileges of any account

SUPER_ADMIN:
  - Full access to all admin features
  - Can create Author accounts: set username, password, displayName, bio
  - Can update/reset Author passwords
  - Can deactivate any user account
  - Can delete comments
  - Can manage featured posts list
  - Can view full analytics dashboard

Implement role checks as:
  1. Next.js middleware using getToken() to protect route groups
  2. Server-side in every API route handler
  3. Never trust client-side role checks alone

---

## ADMIN DASHBOARD (/admin)

Built in Next.js App Router. Protected by middleware.

Routes:
  /admin → redirect to /admin/dashboard
  /admin/dashboard → analytics overview (accessible by AUTHOR + SUPER_ADMIN)
  /admin/posts → post list with analytics per post (accessible by AUTHOR + SUPER_ADMIN)
  /admin/comments → comment moderation (SUPER_ADMIN only)
  /admin/users → user management (SUPER_ADMIN only)
  /admin/users/new → create new Author account (SUPER_ADMIN only)
  /admin/users/[id] → edit Author — change username/password (SUPER_ADMIN only)
  /admin/settings → site settings (SUPER_ADMIN only)

On /admin/users/new: SUPER_ADMIN provides displayName, username, password, bio.
System creates User record (role: AUTHOR, provider: CREDENTIALS) + Author record.
Password is hashed with bcrypt (cost factor 12) before storage.

Authors log in via /login with username + password, NOT via OAuth.

Analytics dashboard shows:
  - Total page views (7d, 30d, 90d toggleable)
  - Top posts by views
  - Top posts by likes
  - New comments (pending moderation if enabled)
  - Traffic by referrer source
  - Returning vs new visitors

---

## PUBLIC BLOG (Astro)

Routes (all fully SSG or SSR):
  / → homepage: featured posts, recent posts, category navigation
  /blog → paginated post listing (12 per page)
  /blog/[slug] → individual post page
  /blog/category/[category] → filtered listing
  /blog/tag/[tag] → tag filtered listing
  /author/[slug] → author profile page with their posts
  /search → client-side search using Fuse.js against a pre-built JSON index

Each /blog/[slug] page includes:
  - Full MDX content rendered with Astro's MDX integration
  - Reading time display
  - Published + updated date
  - Author card with link to /author/[slug]
  - Like button (fetches count from Next.js API, requires auth to toggle)
  - Comment section (fetches from Next.js API, requires auth to post)
  - Related posts (same category, excluding current)
  - Table of contents (auto-generated from headings)
  - Social share buttons (Twitter/X, LinkedIn, Facebook, copy link)
  - Article structured data (JSON-LD)
  - Breadcrumb structured data (JSON-LD)

---

## SEO CONFIGURATION (USA traffic focus)

Implement every item below:

1. Meta tags: unique <title> and <meta name="description"> per page. Title format: "[Post Title] | [SiteName]". Max 60 chars for title, 155 chars for description.

2. Open Graph: og:title, og:description, og:image (1200×630 cover), og:type, og:url, og:site_name, og:locale (en_US).

3. Twitter Card: twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image.

4. Canonical URLs: always set <link rel="canonical"> to the primary URL on every page.

5. Sitemap: generate /sitemap.xml at build time covering all blog post URLs + main pages. Update dynamically when new posts are added.

6. Robots.txt: allow all crawlers. Disallow /admin/*, /api/*, /profile/settings.

7. JSON-LD structured data on every blog post:
   - Article schema: headline, datePublished, dateModified, author (Person), publisher (Organization with logo), image, description, mainEntityOfPage
   - BreadcrumbList schema
   - On homepage: WebSite schema with SearchAction

8. Pagination: use <link rel="prev"> and <link rel="next"> on paginated listing pages. Do NOT use rel="canonical" on paginated pages pointing back to page 1.

9. Image optimization: all images use Next.js <Image> or Astro's <Image> with width, height, alt, loading="lazy" (except above-the-fold images which use loading="eager" priority). Serve WebP. Use srcset.

10. Core Web Vitals optimizations:
    - No layout shift from images (always define width+height)
    - Font loading: use next/font or Astro's font optimization
    - Minimize render-blocking scripts
    - Defer all non-critical third-party scripts

11. Internal linking: each post links to 2–3 related posts. Category and tag pages cross-link. Author pages link to their posts.

12. URL structure: /blog/[slug] (no date in URL for evergreen content). Slugs are lowercase, hyphenated, no special characters.

13. 404 page with helpful links back to homepage and /blog. Return proper HTTP 404 status.

14. Redirects: set up 301 redirects config in next.config.js for any legacy URLs.

---

## API ROUTES (Next.js)

/api/auth/[...nextauth] → NextAuth handler
/api/comments?postSlug= → GET (public), POST (auth required, USER+)
/api/comments/[id] → DELETE (SUPER_ADMIN only or comment owner)
/api/likes?postSlug= → GET (public, returns count + user's liked status), POST/DELETE (auth)
/api/posts/analytics → GET (AUTHOR+, returns analytics per post)
/api/analytics/pageview → POST (anonymous, records a page view — no PII except country from IP header)
/api/admin/users → GET + POST (SUPER_ADMIN only)
/api/admin/users/[id] → PATCH (SUPER_ADMIN only — update username/password)
/api/admin/users/[id]/deactivate → POST (SUPER_ADMIN only)
/api/profile → GET + PATCH (authenticated USER — their own data)
/api/search → GET (returns pre-built JSON search index for Fuse.js)

All API routes must:
  - Validate input with Zod
  - Return proper HTTP status codes
  - Never expose passwordHash in responses
  - Rate-limit sensitive endpoints (login, comments) using Upstash Redis or similar

---

## USER PROFILE

Authenticated users (any role) have a /profile page in Next.js showing:
  - Their avatar, name, joined date
  - Posts they have liked
  - Their comments with links to the post
  - Edit profile form: update name, bio, avatar URL

Authors additionally see their author profile linked from /author/[slug].

---

## ENVIRONMENT VARIABLES

Required in .env:
  DATABASE_URL
  NEXTAUTH_SECRET
  NEXTAUTH_URL
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_SITE_NAME

---

## CODE QUALITY REQUIREMENTS

- TypeScript strict mode throughout (tsconfig strict: true)
- Zod schemas for all API inputs and MDX frontmatter
- Prisma for all DB queries — no raw SQL except for analytics aggregations
- No API secrets exposed to the client
- All forms have loading + error states
- All pages have a Suspense boundary with skeleton loaders
- Use React Server Components by default; Client Components only where necessary (interactivity, hooks)
- ESLint + Prettier configured in /packages/config

---
