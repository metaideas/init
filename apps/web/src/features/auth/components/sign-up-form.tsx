"use client"

import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmit,
} from "@this/ui/web/components/form"
import { Input } from "@this/ui/web/components/input"
import { toast } from "@this/ui/web/components/sonner"

import { signUp } from "~/features/auth/actions"
import { SignUpSchema } from "~/features/auth/validation"

export default function SignUpForm() {
  const { form, handleSubmitWithAction } = useHookFormAction(
    signUp,
    zodResolver(SignUpSchema),
    {
      formProps: {
        defaultValues: {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
      },
      actionProps: {
        onError({ error }) {
          toast.error(error.serverError)
        },
      },
    }
  )

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                <Input {...field} type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Signing up...">
          Sign Up
        </FormSubmit>
      </form>
    </Form>
  )
}
