---
title: Hello, world
date: 2026-01-05
description: The first post on this site, and a quick tour of where content lives.
---

Welcome to the blog. Each post is a Markdown file in `src/content/blog/<locale>/`, and the file name becomes the URL slug.

## Writing a post

Add a file with a `title`, `date`, and `description` in its frontmatter. The schema in `src/content.config.ts` validates every post when the site builds.

## Translating a post

Put the translated file at the same path under another locale folder, such as `es/hello-world.md`.
