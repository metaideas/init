import { getCollection } from "astro:content"

export async function getPosts(locale: string) {
  const posts = await getCollection("blog", (post) => post.id.startsWith(`${locale}/`))

  return posts.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export function getPostSlug(id: string) {
  const [, ...slug] = id.split("/")

  return slug.join("/")
}
