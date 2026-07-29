import rss from "@astrojs/rss"
import { getCollection } from "astro:content"

export async function GET(context: { site?: URL; url: URL }) {
  const posts = await getCollection("blog")

  return rss({
    description: "Updates from the Init project",
    items: posts.map((post) => ({
      description: post.data.description,
      link: `/${post.id.replace("/", "/blog/").replace(/\.mdx?$/, "")}/`,
      pubDate: post.data.date,
      title: post.data.title,
    })),
    site: context.site ?? new URL(context.url.origin),
    title: "Init",
  })
}
