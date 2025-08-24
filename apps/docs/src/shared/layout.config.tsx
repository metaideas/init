import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    // Enable this to display the language switcher
    i18n: true,
    links: [
      {
        active: "none",
        text: "Init",
        url: "https://init.now",
      },
    ],
    nav: {
      title: "Init Docs",
    },
  }
}
