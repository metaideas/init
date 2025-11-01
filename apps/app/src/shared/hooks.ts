import { THEME_COOKIE_NAME } from "@init/utils/constants/cookies"
import { useRouteContext } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { setServerCookie } from "~/shared/server/functions"

// Add the cookies you want to make visible to the client
const VALID_COOKIES = [THEME_COOKIE_NAME] as const
const COOKIE_EVENT_NAME = "cookie-change"

export function useCookieStore<T>(
  key: (typeof VALID_COOKIES)[number],
  defaultValue: T
) {
  const { cookies } = useRouteContext({ strict: false })
  const [value, setValue] = useState<T>((cookies?.[key] ?? defaultValue) as T)
  const ref = useRef(Math.random().toString(36).substring(7))

  useEffect(() => {
    const handleCookieChange = (
      event: CustomEvent<{ key: string; value: T; from: string }>
    ) => {
      if (event.detail.key === key && event.detail.from !== ref.current) {
        setValue(event.detail.value)
      }
    }

    window.addEventListener(
      COOKIE_EVENT_NAME,
      handleCookieChange as EventListener
    )

    return () => {
      window.removeEventListener(
        COOKIE_EVENT_NAME,
        handleCookieChange as EventListener
      )
    }
  }, [key])

  return useMemo(
    () =>
      [
        value,
        (newValue: T) => {
          setValue(newValue)
          setServerCookie({ data: { key, value: String(newValue) } })
          window.dispatchEvent(
            new CustomEvent(COOKIE_EVENT_NAME, {
              detail: { key, value: newValue, from: ref.current },
            })
          )
        },
      ] as const,
    [value, key]
  )
}
