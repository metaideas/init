import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@init/ui/components/card"
import { createFileRoute, Link } from "@tanstack/react-router"
import SignUpForm from "#features/auth/components/sign-up-form.tsx"

export const Route = createFileRoute("/_unauthenticated/sign-up")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />

          <div className="mt-8 text-center text-muted-foreground text-sm">
            Already have an account?{" "}
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
