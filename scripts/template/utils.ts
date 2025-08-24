import Bun from "bun"
import path from "node:path"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".vercel",
  ".DS_Store",
  ".cache",
  ".pnpm-store",
  ".yarn",
  "scripts",
] as const

function checkShouldExclude(filePath: string): boolean {
  return EXCLUDED_DIRS.some(
    (dir) =>
      filePath.includes(`${path.sep}${dir}${path.sep}`) ||
      filePath.endsWith(`${path.sep}${dir}`)
  )
}

export const REMOTE_URL = "git@github.com:metaideas/init.git"

export type WorkspaceType = "apps" | "packages"

export const workspaces = {
  apps: [
    {
      name: "api",
      description: "api - Hono API running on Node.js",
    },
    {
      name: "app",
      description:
        "app - Full-stack Next.js application with next-safe-action and TRPC",
    },
    {
      name: "desktop",
      description:
        "desktop - Tauri desktop application with Vite and Tanstack Router",
    },
    {
      name: "docs",
      description: "docs - Documentation site using Fumadocs",
    },
    {
      name: "extension",
      description: "extension - Browser extension using WXT",
    },
    {
      name: "mobile",
      description: "mobile - Expo application deployed with EAS",
    },
    {
      name: "web",
      description: "web - Next.js marketing site and blog",
    },
  ],
  packages: [
    {
      name: "ai",
      description:
        "ai - AI SDK and vector database for building AI applications",
    },
    {
      name: "analytics",
      description: "analytics - Web and product analytics",
    },
    {
      name: "auth",
      description: "auth - Authentication utilities",
    },
    {
      name: "core",
      description: "core - Core application and business logic",
    },
    {
      name: "db",
      description: "db - Database client and ORM using Drizzle",
    },
    {
      name: "email",
      description: "email - Email templating and sending service using Resend",
    },
    {
      name: "env",
      description: "env - Environment variable management and validation",
    },
    {
      name: "feature-flags",
      description:
        "feature-flags - Feature flag utilities for managing and toggling features",
    },
    {
      name: "internationalization",
      description:
        "internationalization - Internationalization utilities and translation files",
    },
    {
      name: "kv",
      description: "kv - Redis client database integration using Upstash",
    },
    {
      name: "observability",
      description:
        "observability - Logging, error tracking, and monitoring using Sentry and Axiom",
    },
    {
      name: "payments",
      description: "payments - Payment processing utilities using Stripe",
    },
    {
      name: "queue",
      description:
        "queue - Serverless message queue and workflow management using Upstash",
    },
    {
      name: "security",
      description:
        "security - Security utilities and best practices using Arcjet and rate-limiting using Upstash",
    },
    {
      name: "storage",
      description: "storage - Shared storage utilities using UploadThing",
    },
    {
      name: "ui",
      description:
        "ui - Reusable UI components and design system using shadcn/ui",
    },
    {
      name: "utils",
      description: "utils - Shared utilities and helpers",
    },
  ],
} as const

export async function getAllFiles(dir = ".") {
  try {
    const glob = new Bun.Glob("**/*")
    const files: string[] = []

    for await (const file of glob.scan({ cwd: dir, onlyFiles: true })) {
      const filePath = `${dir}/${file}`

      if (!checkShouldExclude(filePath)) {
        files.push(filePath)
      }
    }

    return files
  } catch {
    // Silently fail and return empty array
    return []
  }
}

export async function getVersion(): Promise<string> {
  const templateVersionData = await Bun.file(".template-version.json").json()
  return templateVersionData["."]
}

export async function replaceProjectNameInProjectFiles(projectName: string) {
  const allFiles = await getAllFiles(".")

  // Only process text/code files
  const textFileExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
    ".toml",
    ".env",
    ".example",
  ]
  const textFiles = allFiles.filter(
    (file) =>
      textFileExtensions.some((ext) => file.endsWith(ext)) ||
      file.includes("package.json") ||
      file.includes("tsconfig") ||
      file.includes("README")
  )

  const tasks = textFiles.map(async (file) => {
    try {
      const content = await Bun.file(file).text()
      const replaced = content.replaceAll("@init", `@${projectName}`)
      if (content !== replaced) {
        await Bun.write(file, replaced)
      }
    } catch {
      // Failed to process file, continuing...
    }
  })

  await Promise.all(tasks)
}
