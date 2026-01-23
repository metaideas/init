import type { ReactNode } from "react"
import globals from "@init/ui/globals.css?url"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { RouterContext } from "#router.ts"
import { getTheme } from "#features/theme/server/functions.ts"
import Providers from "#shared/components/providers.tsx"
import { baseLocale } from "#shared/internationalization/runtime.js"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  head: () => ({
    links: [{ href: globals, rel: "stylesheet" }],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Init",
      },
    ],
  }),
  loader: async () => ({
    theme: await getTheme(),
  }),
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
    <html className={theme} lang={baseLocale} suppressHydrationWarning>
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
