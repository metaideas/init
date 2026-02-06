import type { ReactNode } from "react"
import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"
import globals from "@init/ui/globals.css?url"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { RouterContext } from "#router.tsx"
import { ThemeScript } from "#features/theme/components/theme-script.tsx"
import { getTheme, setTheme } from "#features/theme/server/functions.ts"
import { baseLocale } from "#shared/internationalization/runtime.js"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  head: () => ({
    links: [{ href: globals, rel: "stylesheet" }],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "Init" },
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
      <ThemeProvider setTheme={(value) => void setTheme({ data: value })} theme={theme}>
        <ThemeScript />
        <TooltipProvider>
          <Outlet />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>

      <TanStackDevtools
        config={{ position: "bottom-left" }}
        plugins={[
          { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
          { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
          {
            name: "TanStack Form",
            render: <FormDevtoolsPanel />,
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
