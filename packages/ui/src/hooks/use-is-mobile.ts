import { useEffect, useState } from "react"

import { MOBILE_BREAKPOINT } from "@this/utils/constants"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange, { signal })

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    return () => controller.abort()
  }, [])

  return !!isMobile
}
