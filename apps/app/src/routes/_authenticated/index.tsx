import { Avatar, AvatarFallback, AvatarImage } from "@init/ui/components/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@init/ui/components/card"
import { ThemeToggle } from "@init/ui/components/theme"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AdminOnly } from "#features/auth/components/roles.tsx"
import SignOutButton from "#features/auth/components/sign-out-button.tsx"
import { LocaleToggle } from "#shared/components/locale-toggle.tsx"
import { useTRPC } from "#shared/trpc.ts"

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(context.trpc.hello.queryOptions())

    return { user: context.session.user }
  },
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  const trpc = useTRPC()
  const me = useQuery(trpc.hello.queryOptions())

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Card className="">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <AdminOnly>
              <CardDescription>Only admins can see this</CardDescription>
            </AdminOnly>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage alt="Avatar" src={user.image ?? undefined} />
                <AvatarFallback>{user.name[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name ?? "Unknown"}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <div>
              <p>{me.isPending ? "Loading..." : me.data?.message}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <LocaleToggle />
              <ThemeToggle />
            </div>

            <SignOutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
