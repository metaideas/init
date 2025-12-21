import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@init/ui/components/card"
import { Separator } from "@init/ui/components/separator"
import { createFileRoute, Link } from "@tanstack/react-router"
import SignInWithPasswordForm from "#features/auth/components/sign-in-with-password-form.tsx"
import {
  SignInWithGitHubButton,
  SignInWithGoogleButton,
} from "#features/auth/components/sign-in-with-social-buttons.tsx"
import { authClient } from "#shared/auth.ts"

export const Route = createFileRoute("/_unauthenticated/sign-in")({
  component: RouteComponent,
  loader: async () => {
    const session = await authClient.getSession()

    return {
      session,
    }
  },
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle className="text-center">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <SignInWithCodeForm /> */}

          <div className="relative my-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <Separator />
            </div>
            <div className="relative flex justify-center font-medium text-sm leading-6">
              <span className="bg-background px-6 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SignInWithPasswordForm />

          <div className="relative my-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <Separator />
            </div>

            <div className="relative flex justify-center font-medium text-sm leading-6">
              <span className="bg-background px-6 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <SignInWithGoogleButton className="w-full min-w-[180px] sm:flex-1" />
            <SignInWithGitHubButton className="w-full min-w-[180px] sm:flex-1" />
          </div>

          <div className="mt-8 text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
              to="/sign-up"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
