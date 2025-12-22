import { baseLocale } from "@init/internationalization/runtime"
import globals from "@init/ui/globals.css?url"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { ReactNode } from "react"
import { getTheme } from "#features/theme/server/functions.ts"
import type { RouterContext } from "#router.ts"
import ApiConnectionError from "#shared/components/api-connection-error.tsx"
import Providers from "#shared/components/providers.tsx"

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: async () => ({
    theme: await getTheme(),
  }),
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
  errorComponent: ApiConnectionError,
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
