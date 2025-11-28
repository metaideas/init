import { baseLocale } from "@init/internationalization/runtime"
import globals from "@init/ui/globals.css?url"
import { THEME_STORAGE_KEY, THEMES, type Theme } from "@init/utils/constants"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { ReactNode } from "react"
import type { RouterContext } from "#router.tsx"
import Providers from "#shared/components/providers.tsx"
import { getServerCookies } from "#shared/server/functions.ts"

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: async () => {
    const cookies = await getServerCookies()
    // Get the theme from the cookies
    const rawTheme = cookies.get(THEME_STORAGE_KEY) ?? "system"
    const theme = THEMES.includes(rawTheme) ? (rawTheme as Theme) : "system"

    return { cookies, theme }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Init",
      },
    ],
    links: [{ rel: "stylesheet", href: globals }],
  }),
  component: RootComponent,
})

function RootComponent() {
  const { theme } = Route.useLoaderData()

  return (
    <RootDocument>
      <Providers theme={theme}>
        <Outlet />
      </Providers>
      <TanStackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = Route.useLoaderData()

  return (
    <html className={theme} lang={baseLocale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}

        <Scripts />
      </body>
    </html>
  )
}
