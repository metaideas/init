"use client"

import * as Slot from "@rn-primitives/slot"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import type { ComponentProps } from "react"
import { Text, View } from "react-native"
import Animated from "react-native-reanimated"

import { _cn as cn } from "@init/utils/ui"

import useRotationAnimation from "../hooks/use-rotation-animation"
import { Button, buttonTextVariants } from "./button"
import { LoaderCircle } from "./icon"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

function FieldItem(props: ComponentProps<typeof View>) {
  const { className, ...rest } = props
  return <View className={cn("mb-4", className)} {...rest} />
}

function FieldControl(props: ComponentProps<typeof View>) {
  const { className, ...rest } = props
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0
  return (
    <Slot.View
      aria-invalid={hasError}
      className={cn(hasError && "text-destructive", className)}
      {...rest}
    />
  )
}

function FieldLabel(props: ComponentProps<typeof Label>) {
  const { className, ...rest } = props
  const field = useFieldContext()
  const hasError = field.state.meta.errors.length > 0
  return (
    <Label
      className={cn("mb-2", hasError && "text-destructive", className)}
      nativeID={field.name}
      {...rest}
    />
  )
}

function FieldDescription(props: ComponentProps<typeof Text>) {
  const { className, ...rest } = props
  return (
    <Text
      className={cn("mb-2 text-muted-foreground text-xs", className)}
      {...rest}
    />
  )
}

function FieldMessage(props: ComponentProps<typeof Text>) {
  const { className, children, ...rest } = props
  const field = useFieldContext()
  const error = field.state.meta.errors[0]
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <Text
      className={cn("mt-2 font-medium text-destructive text-xs", className)}
      {...rest}
    >
      {body}
    </Text>
  )
}

function FieldInput(props: ComponentProps<typeof Input>) {
  const field = useFieldContext<string>()
  return (
    <Input
      {...props}
      nativeID={field.name}
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
    />
  )
}

function FieldTextarea(props: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />
}

function FormSubmitButton(
  props: ComponentProps<typeof Button> & { loadingText?: string }
) {
  const { loadingText = "Submitting...", children, ...rest } = props
  const form = useFormContext()
  const rotation = useRotationAnimation()

  return (
    <form.Subscribe
      selector={formState => [formState.canSubmit, formState.isSubmitting]}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          {...rest}
          disabled={!canSubmit || isSubmitting}
          onPress={form.handleSubmit}
        >
          {isSubmitting ? (
            <View className="flex-row items-center gap-2">
              <Animated.View style={[rotation]}>
                <LoaderCircle size={20} />
              </Animated.View>
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
}

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
