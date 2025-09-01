import { MDXContent } from "@content-collections/mdx/react"
import { allPosts } from "~/content-collections"

export default function Page() {
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post._meta.path}>
          <a href={`/posts/${post._meta.path}`}>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            <MDXContent code={post.body} />
          </a>
        </li>
      ))}
    </ul>
  )
}
