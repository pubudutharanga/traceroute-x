import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import indexNowSubmitter from "./src/lib/indexNowAstro.ts"

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
      changefreq: "weekly",
      priority: 0.7,
      serialize(item) {
        // Homepage gets highest priority
        if (item.url === "https://traceroutex.vercel.app/" || item.url === "https://traceroutex.vercel.app") {
          item.priority = 1.0;
          item.changefreq = "daily";
        }
        // Blog posts get high priority
        else if (item.url.includes("/blog/") && !item.url.endsWith("/blog/") && !item.url.includes("/category/") && !item.url.includes("/tag/")) {
          item.priority = 0.8;
          item.changefreq = "weekly";
        }
        // Blog listing
        else if (item.url.endsWith("/blog/") || item.url.endsWith("/blog")) {
          item.priority = 0.9;
          item.changefreq = "daily";
        }
        // About page
        else if (item.url.includes("/about")) {
          item.priority = 0.6;
          item.changefreq = "monthly";
        }
        return item;
      },
    }),
    indexNowSubmitter("dcaf3c5ee7764f1682bc927ce510e7f4", "https://traceroutex.vercel.app"),
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
