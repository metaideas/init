"use client"

import * as Slot from "@rn-primitives/slot"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import React from "react"
import { Text, View } from "react-native"

import { _cn as cn } from "@init/utils/ui"

import { Button, buttonTextVariants } from "./button"
import { Loader2 } from "./icon"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const FieldItem = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
  return <View ref={ref} className={cn("mb-4", className)} {...props} />
})
FieldItem.displayName = "FieldItem"

const FieldControl = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0

  return (
    <Slot.View
      ref={ref}
      aria-invalid={hasError}
      className={cn(hasError && "text-destructive", className)}
      {...props}
    />
  )
})
FieldControl.displayName = "FieldControl"

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0

  return (
    <Label
      ref={ref}
      className={cn("mb-2", hasError && "text-destructive", className)}
      nativeID={field.name}
      {...props}
    />
  )
})
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("mb-2 text-muted-foreground text-xs", className)}
      {...props}
    />
  )
})
FieldDescription.displayName = "FieldDescription"

const FieldMessage = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
  const field = useFieldContext()
  const error = field.state.meta.errors[0]

  const body = error ? String(error?.message) : props.children

  if (!body) {
    return null
  }

  return (
    <Text
      ref={ref}
      className={cn("mt-2 font-medium text-destructive text-xs", className)}
      {...props}
    >
      {body}
    </Text>
  )
})
FieldMessage.displayName = "FieldMessage"

const FieldInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ ...props }, ref) => {
  const field = useFieldContext<string>()

  return (
    <Input
      {...props}
      ref={ref}
      nativeID={field.name}
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
    />
  )
})
FieldInput.displayName = "FieldInput"

const FieldTextarea = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  React.ComponentPropsWithoutRef<typeof Textarea>
>(({ ...props }, ref) => {
  return <Textarea {...props} ref={ref} />
})
FieldTextarea.displayName = "FieldTextarea"

const FormSubmitButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    loadingText?: string
  }
>(({ loadingText = "Submitting...", children, ...props }, ref) => {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={formState => [formState.canSubmit, formState.isSubmitting]}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          ref={ref}
          {...props}
          disabled={!canSubmit || isSubmitting}
          onPress={form.handleSubmit}
        >
          {isSubmitting ? (
            <View className="flex-row items-center">
              <Loader2 className="mr-2 size-4 animate-spin" />
              <Text
                className={cn(
                  buttonTextVariants({
                    variant: props.variant,
                    size: props.size,
                  })
                )}
              >
                {loadingText}
              </Text>
            </View>
          ) : (
            children
          )}
        </Button>
      )}
    </form.Subscribe>
  )
})
FormSubmitButton.displayName = "FormSubmitButton"

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Control: FieldControl,
    Description: FieldDescription,
    Input: FieldInput,
    Item: FieldItem,
    Label: FieldLabel,
    Message: FieldMessage,
    Textarea: FieldTextarea,
  },
  formComponents: {
    SubmitButton: FormSubmitButton,
  },
})
