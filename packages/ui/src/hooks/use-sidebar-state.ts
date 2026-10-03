import { useEffect, useEffectEvent, useState } from "react"

import { useIsMobile } from "#hooks/use-mobile.ts"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarStateOptions = {
  defaultOpen: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function useSidebarState({
  defaultOpen,
  open: openProp,
  onOpenChange: setOpenProp,
}: SidebarStateOptions) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen

  function setOpen(value: boolean | ((value: boolean) => boolean)) {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      setUncontrolledOpen(openState)
    }

    // This sets the cookie to keep the sidebar state.
    // oxlint-disable-next-line unicorn/no-document-cookie -- The Cookie Store API is asynchronous and not available in every supported browser.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }

  function toggleSidebar() {
    if (isMobile) {
      setOpenMobile((open) => !open)
    } else {
      setOpen((open) => !open)
    }
  }

  const onKeyboardShortcut = useEffectEvent(toggleSidebar)

  // Adds a keyboard shortcut to toggle the sidebar.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onKeyboardShortcut()
      }
    }

    globalThis.addEventListener("keydown", handleKeyDown)
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return {
    isMobile,
    open,
    openMobile,
    setOpen,
    setOpenMobile,
    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    state: open ? ("expanded" as const) : ("collapsed" as const),
    toggleSidebar,
  }
}
