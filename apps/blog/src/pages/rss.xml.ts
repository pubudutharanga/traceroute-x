import rss from "@astrojs/rss"
import { getCollection } from "astro:content"

export async function GET(context: any) {
  const posts = await getCollection("posts", ({ data }) => !data.draft)
  
  return rss({
    title: "TraceRoute X | Blog",
    description: "A technology blog exploring the latest in technical news, in-depth gadget reviews, software development, and AI breakthroughs.",
    site: context.site || "https://traceroutex.vercel.app",
    items: posts
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description: post.data.description,
        link: `/blog/${post.slug}/`,
        author: post.data.author,
        categories: [post.data.category, ...post.data.tags],
      })),
    customData: `<language>en-us</language>`,
  })
}
