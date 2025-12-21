import { Link } from "expo-router"
import { openBrowserAsync } from "expo-web-browser"
import type { ComponentProps } from "react"
import { Platform } from "react-native"

export default function ExternalLink({ href, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== "web") {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault()
          // Open the link in an in-app browser.
          await openBrowserAsync(typeof href === "string" ? href : href.pathname)
        }
      }}
      target="_blank"
    />
  )
}
