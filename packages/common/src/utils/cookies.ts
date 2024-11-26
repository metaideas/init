import type { CookieOptions } from "hono/utils/cookie"
import { type Runtime, getRuntime } from "./runtime"

export class CookieJar {
  #runtime: Runtime

  constructor() {
    this.#runtime = getRuntime()
  }

  async getAll(): Promise<string[]> {
    if (this.#runtime === "worker") {
      const { getContext } = await import("hono/context-storage")
      const { getCookie } = await import("hono/cookie")

      const ctx = getContext()
      return Object.values(getCookie(ctx))
    }

    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()

    return cookieStore.getAll().map(cookie => cookie.name)
  }

  async get(name: string): Promise<string | undefined> {
    if (this.#runtime === "worker") {
      const { getContext } = await import("hono/context-storage")
      const { getCookie } = await import("hono/cookie")

      const ctx = getContext()
      return getCookie(ctx, name)
    }

    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()

    return cookieStore.get(name)?.value
  }

  async set(
    name: string,
    value: string,
    options?: CookieOptions & { sameSite?: "lax" | "strict" | "none" }
  ): Promise<void> {
    if (this.#runtime === "worker") {
      const { setCookie } = await import("hono/cookie")
      const { getContext } = await import("hono/context-storage")

      const ctx = getContext()
      setCookie(ctx, name, value, options)

      return
    }

    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()

    cookieStore.set(name, value, options)
  }

  async delete(name: string): Promise<void> {
    if (this.#runtime === "worker") {
      const { deleteCookie } = await import("hono/cookie")
      const { getContext } = await import("hono/context-storage")

      const ctx = getContext()
      deleteCookie(ctx, name)

      return
    }

    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()

    cookieStore.delete(name)
  }

  async getSigned(
    name: string,
    secret: string
  ): Promise<string | false | undefined> {
    if (this.#runtime !== "worker") {
      throw new Error(
        "getSigned is only supported in Cloudflare Workers' runtime"
      )
    }

    const { getSignedCookie } = await import("hono/cookie")
    const { getContext } = await import("hono/context-storage")

    const ctx = getContext()

    return await getSignedCookie(ctx, secret, name)
  }

  async getAllSigned(secret: string): Promise<Record<string, string | false>> {
    if (this.#runtime !== "worker") {
      throw new Error(
        "getAllSigned is only supported in Cloudflare Workers' runtime"
      )
    }

    const { getSignedCookie } = await import("hono/cookie")
    const { getContext } = await import("hono/context-storage")

    const ctx = getContext()
    return await getSignedCookie(ctx, secret)
  }

  async setSigned(
    name: string,
    value: string,
    secret: string,
    options?: CookieOptions & { sameSite?: "lax" | "strict" | "none" }
  ): Promise<void> {
    if (this.#runtime !== "worker") {
      throw new Error(
        "setSigned is only supported in Cloudflare Workers' runtime"
      )
    }

    const { setSignedCookie } = await import("hono/cookie")
    const { getContext } = await import("hono/context-storage")

    const ctx = getContext()
    await setSignedCookie(ctx, name, value, secret, options)
  }
}
