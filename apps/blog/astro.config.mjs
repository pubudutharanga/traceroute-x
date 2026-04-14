import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

export default defineConfig({
  site: "https://traceroutex.com",
  output: "static",

  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-dark",
      },
    }),
    react(),
    sitemap(),
  ],

  vite: {
    ssr: {
      noExternal: ["@traceroutex/ui"],
    },
  },
})
