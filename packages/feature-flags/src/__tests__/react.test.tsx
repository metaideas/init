import { beforeAll, describe, expect, it } from "bun:test"
import { GlobalRegistrator } from "@happy-dom/global-registrator"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { Component, type ReactNode, Suspense } from "react"
import { buildReactFlags } from "../react"
import type { Identity } from "../types"

// biome-ignore lint/nursery/useReactFunctionComponents: ErrorBoundary is required for testing error handling with Suspense
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

beforeAll(() => {
  GlobalRegistrator.register()
})

describe("buildReactFlags", () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>{children}</Suspense>
      </QueryClientProvider>
    )
  }

  it("should create a boolean flag hook", async () => {
    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "user123" }),
      decide: async () => ({ value: true }),
    })

    const useBetaAccess = createFlagHook({
      key: "beta-access",
      defaultValue: false,
    })

    const { result } = renderHook(() => useBetaAccess(), {
      wrapper: createWrapper(),
    })

    // Wait for suspense to resolve
    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it("should create a variant flag hook", async () => {
    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "user123" }),
      decide: async () => ({ variant: "dark" }),
    })

    const useTheme = createFlagHook({
      key: "theme",
      defaultValue: "light",
      variants: ["light", "dark", "system"],
    })

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBe("dark")
    })
  })

  it("should support identity override", async () => {
    let receivedIdentity: Identity | undefined

    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "default-user" }),
      decide: (_key, identity) => {
        receivedIdentity = identity
        return Promise.resolve({ value: true })
      },
    })

    const useBetaAccess = createFlagHook({
      key: "beta-access",
      defaultValue: false,
    })

    const { result } = renderHook(
      () => useBetaAccess({ distinctId: "custom-user" }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current).toBe(true)
    })

    expect(receivedIdentity?.distinctId).toBe("custom-user")
  })

  it("should handle errors when identity is null", () => {
    const createFlagHook = buildReactFlags({
      identify: async () => null,
      decide: async () => ({ value: true }),
    })

    const useBetaAccess = createFlagHook({
      key: "beta-access",
      defaultValue: false,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    )

    // This will throw "Identity not found" error
    // The ErrorBoundary should catch it and render the fallback
    renderHook(() => useBetaAccess(), { wrapper })
  })

  it("should validate variants", () => {
    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "user123" }),
      decide: async () => ({ variant: "invalid" }),
    })

    const useTheme = createFlagHook({
      key: "theme",
      defaultValue: "light",
      variants: ["light", "dark", "system"],
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    )

    // This will throw "Invalid variant: invalid" error
    // The ErrorBoundary should catch it and render the fallback
    renderHook(() => useTheme(), { wrapper })
  })

  it("should cache flags using React Query", async () => {
    let decideCalls = 0

    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "user123" }),
      decide: async () =>
        Promise.resolve({
          value: true,
        } as const).then((decision) => {
          decideCalls++
          return decision
        }),
    })

    const useBetaAccess = createFlagHook({
      key: "beta-access",
      defaultValue: false,
    })

    const wrapper = createWrapper()

    // First render
    const { result: result1 } = renderHook(() => useBetaAccess(), { wrapper })

    await waitFor(() => {
      expect(result1.current).toBe(true)
    })

    expect(decideCalls).toBe(1)

    // Second render - should use cache
    const { result: result2 } = renderHook(() => useBetaAccess(), { wrapper })

    // Should have cached value immediately
    expect(result2.current).toBe(true)

    // Should not call decide again (React Query cache)
    expect(decideCalls).toBe(1)
  })

  it("should use different cache keys for different identities", async () => {
    let callCount = 0

    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "default" }),
      decide: async () =>
        Promise.resolve({
          value: true,
        } as const).then((decision) => {
          callCount++
          return decision
        }),
    })

    const useBetaAccess = createFlagHook({
      key: "beta-access",
      defaultValue: false,
    })

    const wrapper = createWrapper()

    // Call with default identity
    const { result: result1 } = renderHook(() => useBetaAccess(), { wrapper })

    await waitFor(() => {
      expect(result1.current).toBe(true)
    })

    expect(callCount).toBe(1)

    // Call with different identity - should trigger new query
    const { result: result2 } = renderHook(
      () => useBetaAccess({ distinctId: "custom" }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result2.current).toBe(true)
    })

    // Should have called decide again for different identity
    expect(callCount).toBe(2)
  })

  it("should work with type-safe variants", async () => {
    const createFlagHook = buildReactFlags({
      identify: async () => ({ distinctId: "user123" }),
      decide: async () => ({ variant: "system" }),
    })

    const useTheme = createFlagHook({
      key: "theme",
      defaultValue: "light" as const,
      variants: ["light", "dark", "system"],
    })

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBe("system")
    })

    // TypeScript type check
    const value: "light" | "dark" | "system" = result.current
    expect(value).toBe("system")
  })
})
