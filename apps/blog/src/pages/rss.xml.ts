import rss from "@astrojs/rss"
import { getCollection } from "astro:content"

export async function GET(context: any) {
  const posts = await getCollection("posts", ({ data }) => !data.draft)
  
  return rss({
    // `<title>` field in output xml
    title: "TraceRoute X | Blog",
    // `<description>` field in output xml
    description: "A technology blog exploring modern web development, cloud architecture, and engineering best practices.",
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site || "https://traceroutex.com",
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      // Compute out link from post slug.
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/blog/${post.slug}/`,
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  })
}
