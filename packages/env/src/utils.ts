/**
 * Get the runtime environment variables. Uses Hono's Context Storage Middleware
 * to access the environment variables in Cloudflare Workers.
 */
export async function getRuntimeEnv(): Promise<
  Record<string, string | undefined>
> {
  // Check if we're in a Cloudflare Worker environment by checking if the
  // process.env is empty
  if (Object.keys(process.env).length === 0) {
    const { getContext } = await import("hono/context-storage")
    const ctx = getContext()

    return (ctx.env ?? {}) as Record<string, string | undefined>
  }

  return process.env
}
