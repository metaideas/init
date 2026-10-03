import { useEffect, useRef } from "react"

export function useFocusWhen<TElement extends HTMLElement>(shouldFocus: boolean | undefined) {
  const ref = useRef<TElement>(null)

  useEffect(() => {
    if (shouldFocus) ref.current?.focus()
  }, [shouldFocus])

  return ref
}
