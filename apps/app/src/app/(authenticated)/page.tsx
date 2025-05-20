import { Avatar, AvatarFallback, AvatarImage } from "@init/ui/components/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@init/ui/components/card"

import { getTranslations } from "@init/internationalization/nextjs/server"
import { AdminOnly } from "~/features/auth/components/roles"
import SignOutButton from "~/features/auth/components/sign-out-button"
import { LocaleToggle } from "~/shared/components/locale-toggle"
import { getCurrentUser } from "~/shared/server/loaders"

export default async function Page() {
  const user = await getCurrentUser()
  const t = await getTranslations("app")

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Card className="">
          <CardHeader>
            <CardTitle>
              {t("dashboard.home.welcome", { name: user.name })}
            </CardTitle>
            <AdminOnly>
              <CardDescription>Only admins can see this</CardDescription>
            </AdminOnly>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.image ?? undefined} alt="Avatar" />
                <AvatarFallback>{user.name[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name ?? "Unknown"}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <LocaleToggle />

            <SignOutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
