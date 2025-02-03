import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@this/ui/web/components/card"
import { Separator } from "@this/ui/web/components/separator"

import SignInWithPasswordForm from "~/features/auth/components/sign-in-with-password-form"
import {
  SignInWithGitHubButton,
  SignInWithGoogleButton,
} from "~/features/auth/components/sign-in-with-social-buttons"

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle className="text-center">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <SignInWithCodeForm /> */}

          <div className="relative my-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <Separator decorative />
            </div>
            <div className="relative flex justify-center font-medium text-sm leading-6">
              <span className="bg-background px-6 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SignInWithPasswordForm />

          <div className="relative my-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <Separator decorative />
            </div>

            <div className="relative flex justify-center font-medium text-sm leading-6">
              <span className="bg-background px-6 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <SignInWithGoogleButton />
            <SignInWithGitHubButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
