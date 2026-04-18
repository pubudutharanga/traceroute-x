import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

export default defineConfig({
  site: "https://traceroutex.vercel.app",
  output: "static",
  compressHTML: true,

  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-dark",
      },
    }),
    react(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US" },
      },
    }),
  ],

  vite: {
    ssr: {
      noExternal: ["@traceroutex/ui"],
      external: ["@traceroutex/db"],
    },
    build: {
      rollupOptions: {
        external: ["@traceroutex/db"],
      },
    },
  },
})

// Trigger Astro restart
