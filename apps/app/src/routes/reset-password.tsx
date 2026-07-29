import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@init/ui/components/card"
import * as z from "@init/utils/schema"
import { createFileRoute, Link } from "@tanstack/react-router"
import ResetPasswordForm from "#features/auth/components/reset-password-form.tsx"

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute("/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  const { token } = Route.useSearch()

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle className="text-center">Choose a new password</CardTitle>
          <CardDescription className="text-center">
            {token
              ? "Enter and confirm the new password for your account."
              : "This password reset link is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="text-center text-sm">
              <Link className="font-medium underline underline-offset-4" to="/forgot-password">
                Request a new reset link
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
