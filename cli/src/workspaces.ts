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
      description: "Hono API running on Node.js",
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
      description: "Full-stack TanStack Start application with server functions",
      name: "app",
    },
    {
      dependencies: ["env", "observability", "ui", "utils"],
      description: "Tauri desktop application with TanStack Router",
      name: "desktop",
    },
    {
      dependencies: [],
      description: "Documentation site using Astro + Starlight",
      name: "docs",
    },
    {
      dependencies: ["env", "observability", "ui", "utils"],
      description: "Browser extension using WXT",
      name: "extension",
    },
    {
      dependencies: ["auth", "env", "observability", "utils"],
      description: "Expo application deployed with EAS",
      name: "mobile",
    },
    {
      dependencies: ["env", "internationalization", "ui", "utils"],
      description: "Astro marketing site and blog",
      name: "web",
    },
  ],
  packages: [
    {
      dependencies: [],
      description: "Model provider registry using the AI SDK",
      name: "ai",
    },
    {
      dependencies: [],
      description: "Web and product analytics",
      name: "analytics",
    },
    {
      dependencies: ["utils"],
      description: "Authentication utilities using Better Auth",
      name: "auth",
    },
    {
      dependencies: ["auth", "env", "observability", "utils"],
      description: "Convex backend with Better Auth integration",
      name: "backend",
    },
    {
      dependencies: [],
      description: "Core application and business logic",
      name: "core",
    },
    {
      dependencies: ["env", "utils"],
      description: "Database client and ORM using Drizzle",
      name: "db",
    },
    {
      dependencies: [],
      description: "Email templating and sending service using Resend",
      name: "email",
    },
    {
      dependencies: [],
      description: "Environment variable management and validation using Zod",
      name: "env",
    },
    {
      dependencies: [],
      description: "Custom error types using Faultier",
      name: "error",
    },
    {
      dependencies: [],
      description: "Internationalization utilities and translation files",
      name: "internationalization",
    },
    {
      dependencies: [],
      description: "Redis client database integration",
      name: "kv",
    },
    {
      dependencies: [],
      description: "Logging, error tracking, and monitoring using Sentry",
      name: "observability",
    },
    {
      dependencies: [],
      description: "Payment processing utilities using Stripe",
      name: "payments",
    },
    {
      dependencies: [],
      description: "Serverless message queue and workflow management using Upstash",
      name: "queue",
    },
    {
      dependencies: [],
      description: "Shared storage utilities using S3",
      name: "storage",
    },
    {
      dependencies: ["utils"],
      description: "Reusable UI components and design system using shadcn/ui",
      name: "ui",
    },
    {
      dependencies: [],
      description: "Shared utilities and helpers",
      name: "utils",
    },
    {
      dependencies: ["observability", "utils"],
      description: "Background tasks and workflows using Inngest",
      name: "workflows",
    },
  ],
} as const
