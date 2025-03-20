export async function tryCatch<T, E = Error>(
  fn: (() => T | Promise<T>) | Promise<T>
): Promise<[data: T, error: null] | [data: null, error: E]> {
  try {
    const result = typeof fn === "function" ? await fn() : await fn
    return [result, null]
  } catch (error) {
    return [null, error as E]
  }
}
