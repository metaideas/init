import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@init/ui/components/card"
import Link from "next/link"
import SignUpForm from "~/features/auth/components/sign-up-form"

export default function Page() {
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
              href="/sign-in"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
