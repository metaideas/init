import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@init/ui/components/card"

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
        </CardContent>
      </Card>
    </div>
  )
}
