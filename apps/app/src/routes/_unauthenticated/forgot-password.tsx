import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@init/ui/components/card"
import { createFileRoute, Link } from "@tanstack/react-router"
import ForgotPasswordForm from "#features/auth/components/forgot-password-form.tsx"

export const Route = createFileRoute("/_unauthenticated/forgot-password")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle className="text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />

          <div className="mt-8 text-center text-muted-foreground text-sm">
            Remember your password?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
              to="/sign-in"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
