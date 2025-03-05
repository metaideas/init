"use client"

import { captureException } from "@this/observability/error/nextjs"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function useReportError(error: Error) {
  const pathname = usePathname()

  useEffect(() => {
    captureException(error, {
      data: {
        pathname,
      },
    })
  }, [error, pathname])
}
