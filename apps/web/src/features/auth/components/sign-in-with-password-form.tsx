"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import Link from "next/link"

import { Button } from "@this/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmit,
} from "@this/ui/form"
import { Input } from "@this/ui/input"

import { signInWithPassword } from "~/features/auth/actions"
import { SignInWithPasswordSchema } from "~/features/auth/validation"

export default function SignInWithPasswordForm() {
  const { form, handleSubmitWithAction } = useHookFormAction(
    signInWithPassword,
    zodResolver(SignInWithPasswordSchema),
    { formProps: { defaultValues: { email: "", password: "" } } }
  )

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} type="email" autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="password" />
              </FormControl>
              <Button variant="link" asChild className="p-0">
                <Link href="/sign-in/reset-password" className="h-auto">
                  Forgot password?
                </Link>
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Signing in...">
          Sign in
        </FormSubmit>
      </form>
    </Form>
  )
}
