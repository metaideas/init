import { spawn } from "node:child_process"
import { access, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { glob } from "fast-glob"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
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

export const workspaces = {
  apps: [
    {
      name: "api",
      description: "api - Hono API running on Node.js",
      dependencies: [
        "auth",
        "db",
        "env",
        "kv",
        "observability",
        "security",
        "utils",
      ],
    },
    {
      name: "app",
      description:
        "app - Full-stack TanStack Start application with server functions",
      dependencies: [
        "auth",
        "db",
        "env",
        "internationalization",
        "kv",
        "observability",
        "security",
        "ui",
        "utils",
      ],
    },
    {
      name: "desktop",
      description: "desktop - Tauri desktop application with TanStack Router",
      dependencies: ["env", "observability", "ui", "utils"],
    },
    {
      name: "docs",
      description: "docs - Documentation site using Astro + Starlight",
      dependencies: [],
    },
    {
      name: "extension",
      description: "extension - Browser extension using WXT",
      dependencies: ["env", "observability", "ui", "utils"],
    },
    {
      name: "mobile",
      description: "mobile - Expo application deployed with EAS",
      dependencies: ["auth", "env", "observability", "utils"],
    },
    {
      name: "web",
      description: "web - Astro marketing site and blog",
      dependencies: ["env", "internationalization", "ui", "utils"],
    },
  ],
  packages: [
    {
      name: "ai",
      description:
        "ai - AI SDK and vector database for building AI applications",
      dependencies: [],
    },
    {
      name: "analytics",
      description: "analytics - Web and product analytics",
      dependencies: [],
    },
    {
      name: "auth",
      description: "auth - Authentication utilities using Better Auth",
      dependencies: ["utils"],
    },
    {
      name: "backend",
      description: "backend - Convex backend with Better Auth integration",
      dependencies: ["auth", "env", "observability", "utils"],
    },
    {
      name: "core",
      description: "core - Core application and business logic",
      dependencies: [],
    },
    {
      name: "db",
      description: "db - Database client and ORM using Drizzle",
      dependencies: ["env", "utils"],
    },
    {
      name: "email",
      description: "email - Email templating and sending service using Resend",
      dependencies: [],
    },
    {
      name: "env",
      description: "env - Environment variable management and validation",
      dependencies: [],
    },
    {
      name: "feature-flags",
      description:
        "feature-flags - Feature flag utilities for managing and toggling features",
      dependencies: [],
    },
    {
      name: "internationalization",
      description:
        "internationalization - Internationalization utilities and translation files",
      dependencies: [],
    },
    {
      name: "kv",
      description: "kv - Redis client database integration using Upstash",
      dependencies: [],
    },
    {
      name: "observability",
      description:
        "observability - Logging, error tracking, and monitoring using Sentry and Axiom",
      dependencies: [],
    },
    {
      name: "payments",
      description: "payments - Payment processing utilities using Stripe",
      dependencies: [],
    },
    {
      name: "queue",
      description:
        "queue - Serverless message queue and workflow management using Upstash",
      dependencies: [],
    },
    {
      name: "security",
      description:
        "security - Security utilities and best practices using Arcjet and rate-limiting using Upstash",
      dependencies: ["kv"],
    },
    {
      name: "storage",
      description: "storage - Shared storage utilities using UploadThing",
      dependencies: [],
    },
    {
      name: "ui",
      description:
        "ui - Reusable UI components and design system using shadcn/ui",
      dependencies: ["utils"],
    },
    {
      name: "utils",
      description: "utils - Shared utilities and helpers",
      dependencies: [],
    },
  ],
} as const

export async function getAllFiles(dir = "."): Promise<string[]> {
  try {
    const files = await glob("**/*", {
      cwd: dir,
      onlyFiles: true,
      absolute: false,
    })

    return files
      .map((file) => `${dir}/${file}`)
      .filter((filePath) => !checkShouldExclude(filePath))
  } catch {
    // Silently fail and return empty array
    return []
  }
}

export async function getVersion(): Promise<string> {
  try {
    const content = await readFile(".template-version.json", "utf-8")
    const data = JSON.parse(content)
    return data["."]
  } catch {
    return ""
  }
}

export async function replaceProjectNameInProjectFiles(
  projectName: string
): Promise<void> {
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
      const content = await readFile(file, "utf-8")
      const replaced = content.replaceAll("@init", `@${projectName}`)
      if (content !== replaced) {
        await writeFile(file, replaced, "utf-8")
      }
    } catch {
      // Failed to process file, continuing...
    }
  })

  await Promise.all(tasks)
}

export function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("sh", ["-c", command], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    proc.stdout?.on("data", (data) => {
      stdout += data.toString()
    })

    proc.stderr?.on("data", (data) => {
      stderr += data.toString()
    })

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`))
      } else {
        resolve(stdout)
      }
    })

    proc.on("error", (error) => {
      reject(error)
    })
  })
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}
