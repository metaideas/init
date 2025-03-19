"use client"

import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import { AlertCircle, Loader2Icon } from "lucide-react"
import React from "react"
// @ts-expect-error -- this type was removed from react-dom but it's still
// available to be used. Remove this once we update to React 19.
import { useFormStatus } from "react-dom"

import { cn } from "@init/utils/classname"

import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const FieldItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />
})
FieldItem.displayName = "FieldItem"

const FieldControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0

  return (
    <Slot
      ref={ref}
      aria-invalid={hasError}
      className={cn(hasError && "text-destructive", className)}
      {...props}
    />
  )
})
FieldControl.displayName = "FieldControl"

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0

  return (
    <Label
      ref={ref}
      className={cn(hasError && "text-destructive", className)}
      htmlFor={field.name}
      {...props}
    />
  )
})
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FieldDescription.displayName = "FieldDescription"

const FieldMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const field = useFieldContext()
  const error = field.state.meta.errors[0]

  const body = error ? String(error?.message) : props.children

  if (!body) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("font-medium text-[0.8rem] text-destructive", className)}
      {...props}
    >
      {body}
    </div>
  )
})
FieldMessage.displayName = "FieldMessage"

const FieldInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ ...props }, ref) => {
  const field = useFieldContext<string>()

  return (
    <Input
      {...props}
      ref={ref}
      name={field.name}
      id={field.name}
      value={field.state.value}
      onChange={e => {
        field.handleChange(e.target.value)
      }}
      onBlur={() => {
        field.handleBlur()
      }}
    />
  )
})
FieldInput.displayName = "FieldInput"

const FormSubmitButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    loadingText?: string
  }
>(({ loadingText = "Submitting...", children, ...props }, ref) => {
  const form = useFormContext()
  const status = useFormStatus()

  return (
    <form.Subscribe
      selector={formState => [formState.canSubmit, formState.isSubmitting]}
    >
      {([canSubmit, isSubmitting]) => (
        <Button ref={ref} {...props} disabled={!canSubmit || status.pending}>
          {isSubmitting || status.pending ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              {loadingText}
            </>
          ) : (
            children
          )}
        </Button>
      )}
    </form.Subscribe>
  )
})
FormSubmitButton.displayName = "FormSubmitButton"

const FormServerError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
  }
>(({ title = "Error" }, ref) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={formState => [formState.errorMap.onServer ?? []]}>
      {([error]) => {
        if (!error || typeof error !== "string") {
          return null
        }

        return (
          <Alert variant="destructive" ref={ref}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )
      }}
    </form.Subscribe>
  )
})
FormServerError.displayName = "FormServerError"

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Control: FieldControl,
    Description: FieldDescription,
    Item: FieldItem,
    Input: FieldInput,
    Label: FieldLabel,
    Message: FieldMessage,
  },
  formComponents: {
    SubmitButton: FormSubmitButton,
    ServerError: FormServerError,
  },
})
