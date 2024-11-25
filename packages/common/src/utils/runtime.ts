export const isWorkerRuntime =
  typeof navigator !== "undefined" &&
  navigator.userAgent.includes("Cloudflare-Workers")

export const isNodeRuntime =
  typeof navigator !== "undefined" && navigator.userAgent.includes("Node.js")

export const isEdgeRuntime = typeof navigator === "undefined"

/**
 * Get the runtime environment variables. Uses Hono's Context Storage Middleware
 * to access the environment variables in Cloudflare Workers.
 */
export async function getRuntimeEnv(): Promise<
  Record<string, string | undefined>
> {
  if (isWorkerRuntime) {
    const { getContext } = await import("hono/context-storage")
    const ctx = getContext()

    return (ctx.env ?? {}) as Record<string, string | undefined>
  }

  return process.env
}
