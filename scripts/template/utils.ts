import { Octokit } from "@octokit/rest"
import Bun from "bun"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".cache",
  ".pnpm-store",
  ".yarn",
  "scripts/template",
] as const

const EXCLUDED_FILES = [".DS_Store"] as const
const PATH_NORMALIZE_REGEX = /^\.\//
const PATH_SEP_NORMALIZE_REGEX = /\\/g

function checkShouldExclude(filePath: string): boolean {
  // Normalize path separators and remove leading ./
  const normalizedPath = filePath
    .replace(PATH_NORMALIZE_REGEX, "")
    .replace(PATH_SEP_NORMALIZE_REGEX, "/")

  // Check if file path contains any excluded directory
  const containsExcludedDir = EXCLUDED_DIRS.some(
    (dir) =>
      normalizedPath.includes(`/${dir}/`) ||
      normalizedPath.endsWith(`/${dir}`) ||
      normalizedPath.startsWith(`${dir}/`)
  )

  if (containsExcludedDir) {
    return true
  }

  // Check if file path ends with any excluded file name
  const endsWithExcludedFile = EXCLUDED_FILES.some(
    (file) => normalizedPath.endsWith(`/${file}`) || normalizedPath === file
  )

  return endsWithExcludedFile
}

/**
 * Execute promises with a concurrency limit.
 * Useful for limiting concurrent file operations or API calls.
 *
 * @param tasks - Array of async functions to execute
 * @param limit - Maximum number of concurrent executions (default: 10)
 * @returns Array of results in the same order as tasks
 */
async function limitConcurrency<T>(tasks: Array<() => Promise<T>>, limit = 10): Promise<T[]> {
  const results: T[] = Array.from({ length: tasks.length })
  const queue = tasks.map((task, index) => ({ index, task }))
  const executing: Array<Promise<void>> = []

  const processQueue = async (): Promise<void> => {
    const next = queue.shift()
    if (!next) {
      return
    }

    try {
      results[next.index] = await next.task()
    } catch {
      // Failed to process task, continuing...
    }

    // Process next item in queue
    if (queue.length > 0) {
      executing.push(processQueue())
    }
  }

  // Start initial batch of workers
  const initialBatch = Math.min(limit, tasks.length)
  for (let i = 0; i < initialBatch; i += 1) {
    executing.push(processQueue())
  }

  await Promise.all(executing)
  return results
}

export const workspaces = {
  apps: [
    {
      dependencies: [
        "auth",
        "db",
        "env",
        "error",
        "kv",
        "observability",
        "queue",
        "workflows",
        "utils",
      ],
      description: "api - Hono API running on Node.js",
      name: "api",
    },
    {
      dependencies: [
        "auth",
        "db",
        "env",
        "error",
        "internationalization",
        "kv",
        "observability",
        "ui",
        "utils",
      ],
      description: "app - Full-stack TanStack Start application with server functions",
      name: "app",
    },
    {
      dependencies: ["env", "observability", "ui", "utils"],
      description: "desktop - Tauri desktop application with TanStack Router",
      name: "desktop",
    },
    {
      dependencies: [],
      description: "docs - Documentation site using Astro + Starlight",
      name: "docs",
    },
    {
      dependencies: ["env", "observability", "ui", "utils"],
      description: "extension - Browser extension using WXT",
      name: "extension",
    },
    {
      dependencies: ["auth", "env", "observability", "utils"],
      description: "mobile - Expo application deployed with EAS",
      name: "mobile",
    },
    {
      dependencies: ["env", "internationalization", "ui", "utils"],
      description: "web - Astro marketing site and blog",
      name: "web",
    },
  ],
  packages: [
    {
      dependencies: [],
      description: "ai - Model provider registry using the AI SDK",
      name: "ai",
    },
    {
      dependencies: [],
      description: "analytics - Web and product analytics",
      name: "analytics",
    },
    {
      dependencies: ["utils"],
      description: "auth - Authentication utilities using Better Auth",
      name: "auth",
    },
    {
      dependencies: ["auth", "env", "observability", "utils"],
      description: "backend - Convex backend with Better Auth integration",
      name: "backend",
    },
    {
      dependencies: [],
      description: "core - Core application and business logic",
      name: "core",
    },
    {
      dependencies: ["env", "utils"],
      description: "db - Database client and ORM using Drizzle",
      name: "db",
    },
    {
      dependencies: [],
      description: "email - Email templating and sending service using Resend",
      name: "email",
    },
    {
      dependencies: [],
      description: "env - Environment variable management and validation",
      name: "env",
    },
    {
      dependencies: [],
      description: "error - Custom error types using faultier",
      name: "error",
    },
    {
      dependencies: [],
      description: "internationalization - Internationalization utilities and translation files",
      name: "internationalization",
    },
    {
      dependencies: [],
      description: "kv - Redis client database integration using Upstash",
      name: "kv",
    },
    {
      dependencies: [],
      description: "observability - Logging, error tracking, and monitoring using Sentry and Axiom",
      name: "observability",
    },
    {
      dependencies: [],
      description: "payments - Payment processing utilities using Stripe",
      name: "payments",
    },
    {
      dependencies: [],
      description: "queue - Serverless message queue and workflow management using Upstash",
      name: "queue",
    },
    {
      dependencies: [],
      description: "workflows - Background tasks and workflows using Inngest",
      name: "workflows",
    },

    {
      dependencies: [],
      description: "storage - Shared storage utilities using UploadThing",
      name: "storage",
    },
    {
      dependencies: ["utils"],
      description: "ui - Reusable UI components and design system using shadcn/ui",
      name: "ui",
    },
    {
      dependencies: [],
      description: "utils - Shared utilities and helpers",
      name: "utils",
    },
  ],
} as const

async function getAllFiles(dir = ".") {
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

export async function replaceProjectNameInProjectFiles(
  projectName: string,
  currentProjectName?: string
) {
  const allFiles = await getAllFiles(".")

  // Only process text/code files
  const textFileExtensions = [
    ".astro",
    ".css",
    ".env",
    ".example",
    ".hbs",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mdc",
    ".mdx",
    ".scss",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
  ]
  const textFiles = allFiles.filter(
    (file) =>
      textFileExtensions.some((ext) => file.endsWith(ext)) ||
      file.includes("package.json") ||
      file.includes("tsconfig") ||
      file.includes("README")
  )

  const tasks = textFiles.map((file) => async (): Promise<void> => {
    try {
      const content = await Bun.file(file).text()
      let replaced = content.replaceAll("@init", `@${projectName}`)

      // If currentProjectName is provided, also replace it
      if (currentProjectName && currentProjectName !== "init") {
        replaced = replaced.replaceAll(`@${currentProjectName}`, `@${projectName}`)
      }

      if (content !== replaced) {
        await Bun.write(file, replaced)
      }
    } catch {
      // Failed to process file, continuing...
    }
  })

  // Limit concurrent file operations to avoid overwhelming the system
  await limitConcurrency(tasks, 10)
}

export interface ReleaseInfo {
  tagName: string
  name: string
  publishedAt: string
  body: string
}

const TEMPLATE_VERSION_FILE = ".template-version.json"
const VERSION_PREFIX_REGEX = /^v/

export async function getVersion(): Promise<string | null> {
  try {
    const file = Bun.file(TEMPLATE_VERSION_FILE)
    if (await file.exists()) {
      const data = (await file.json()) as Record<string, unknown>
      return (data["."] as string | undefined) ?? null
    }
    return null
  } catch {
    return null
  }
}

export async function getLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const octokit = new Octokit()
    const response = await octokit.repos.getLatestRelease({
      owner: "metaideas",
      repo: "init",
    })

    return {
      body: response.data.body ?? "",
      name: response.data.name ?? "",
      publishedAt: response.data.published_at ?? "",
      tagName: response.data.tag_name,
    }
  } catch {
    return null
  }
}

export function compareVersions(current: string, latest: string): number {
  // Remove 'v' prefix if present
  const currentClean = current.replace(VERSION_PREFIX_REGEX, "")
  const latestClean = latest.replace(VERSION_PREFIX_REGEX, "")

  const currentParts = currentClean.split(".").map(Number)
  const latestParts = latestClean.split(".").map(Number)

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i += 1) {
    const currentPart = currentParts[i] ?? 0
    const latestPart = latestParts[i] ?? 0

    if (currentPart < latestPart) {
      return -1
    }
    if (currentPart > latestPart) {
      return 1
    }
  }

  return 0
}

export async function updateTemplateVersion(version: string): Promise<void> {
  const data = { ".": version }
  await Bun.write(TEMPLATE_VERSION_FILE, `${JSON.stringify(data, null, 2)}\n`)
}
