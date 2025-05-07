import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  // Enable this to display the language switcher
  i18n: true,
  links: [
    {
      active: "none",
      text: "Website",
      url: "/",
    },
  ],
  nav: {
    // can be JSX too!
    title: "Init Docs",
  },
}
