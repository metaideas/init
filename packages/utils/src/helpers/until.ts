export async function until<T, E = Error>(
  promise: Promise<T>
): Promise<[data: T, error: null] | [data: null, error: E]> {
  try {
    const result = await promise
    return [result, null]
  } catch (error) {
    return [null, error as E]
  }
}
