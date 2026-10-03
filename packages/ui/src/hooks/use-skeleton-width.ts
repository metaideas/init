import { useId } from "react"

/**
 * Picks a width between 50% and 89% from the component's `useId`, so the server and the client
 * render the same width and hydration matches.
 */
export function useSkeletonWidth() {
  const id = useId()
  let hash = 0

  for (const character of id) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 40
  }

  return `${hash + 50}%`
}
