import { createWorkflowClient } from "@this/queue/workflows"
import { Avatar, AvatarFallback, AvatarImage } from "@this/ui/avatar"
import { Button } from "@this/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@this/ui/card"

import { AdminOnly } from "~/features/auth/components/roles"
import SignOutButton from "~/features/auth/components/sign-out-button"
import { getCurrentUser } from "~/shared/server/loaders"

export default async function Page() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Card className="">
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
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
            <div>
              <Button
                onClick={async () => {
                  "use server"

                  const { triggerWorkflow } = createWorkflowClient(
                    "http://localhost:3001"
                  )

                  await triggerWorkflow("test/workflow", {
                    name: "John Doe",
                  })
                }}
              >
                Trigger workflow
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <SignOutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
