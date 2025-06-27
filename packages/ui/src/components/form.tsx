"use client"

import { cn } from "@init/utils/ui"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import { AlertCircle, Loader2Icon } from "lucide-react"
import { type Label as LabelPrimitive, Slot as SlotPrimitive } from "radix-ui"
import type React from "react"
import { useFormStatus } from "react-dom"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

function FieldItem(props: React.ComponentProps<"div">) {
  return <div {...props} className={cn("space-y-2", props.className)} />
}
FieldItem.displayName = "FieldItem"

function FieldControl(props: React.ComponentProps<"div">) {
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0

  return (
    <SlotPrimitive.Slot
      {...props}
      aria-invalid={hasError}
      className={cn(hasError && "text-destructive", props.className)}
    />
  )
}
FieldControl.displayName = "FieldControl"

function FieldLabel(props: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0

  return (
    <Label
      {...props}
      className={cn(hasError && "text-destructive", props.className)}
      htmlFor={field.name}
    />
  )
}
FieldLabel.displayName = "FieldLabel"

function FieldDescription(props: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("text-[0.8rem] text-muted-foreground", props.className)}
    />
  )
}
FieldDescription.displayName = "FieldDescription"

function FieldMessage(props: React.ComponentProps<"div">) {
  const field = useFieldContext()
  const error = field.state.meta.errors[0]

  const body = error ? String(error?.message) : props.children

  if (!body) {
    return null
  }

  return (
    <div
      {...props}
      className={cn(
        "font-medium text-[0.8rem] text-destructive",
        props.className
      )}
    >
      {body}
    </div>
  )
}
FieldMessage.displayName = "FieldMessage"

function FieldInput(props: React.ComponentProps<typeof Input>) {
  const field = useFieldContext<string>()

  return (
    <Input
      {...props}
      id={field.name}
      name={field.name}
      onBlur={() => {
        field.handleBlur()
      }}
      onChange={(e) => {
        field.handleChange(e.target.value)
      }}
      value={field.state.value}
    />
  )
}
FieldInput.displayName = "FieldInput"

function FormSubmitButton({
  loadingText = "Submitting...",
  children,
  ...props
}: React.ComponentProps<typeof Button> & { loadingText?: string }) {
  const form = useFormContext()
  const status = useFormStatus()

  return (
    <form.Subscribe
      selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
    >
      {([canSubmit, isSubmitting]) => (
        <Button {...props} disabled={!canSubmit || status.pending}>
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
}
FormSubmitButton.displayName = "FormSubmitButton"

function FormServerError({
  title = "Error",
  ...props
}: React.ComponentProps<"div"> & { title?: string }) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(formState) => [formState.errorMap.onServer ?? []]}
    >
      {([error]) => {
        if (!error || typeof error !== "string") {
          return null
        }

        return (
          <Alert variant="destructive" {...props}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )
      }}
    </form.Subscribe>
  )
}
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
