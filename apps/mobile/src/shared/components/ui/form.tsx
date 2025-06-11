import { Icon, type IconProps } from "@roninoss/icons"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import type { ComponentProps } from "react"
import { Platform, View, type ViewProps } from "react-native"

import { cn } from "@init/utils/ui"

import { ActivityIndicator } from "~/shared/components/ui/activity-indicator"
import { Button, buttonTextVariants } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { TextField } from "~/shared/components/ui/text-field"
import { useColorScheme } from "~/shared/hooks"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

function FormSection({
  rootClassName,
  className,
  footnote,
  footnoteClassName,
  ios,
  materialIconProps,
  children,
  ...props
}: ViewProps & {
  rootClassName?: string
  footnote?: string
  footnoteClassName?: string
  ios?: {
    title: string
    titleClassName?: string
  }
  materialIconProps?: Omit<IconProps<"material">, "namingScheme" | "ios">
}) {
  const { colors } = useColorScheme()

  return (
    <View
      className={cn(
        "relative",
        Platform.OS !== "ios" && !!materialIconProps && "flex-row gap-4",
        rootClassName
      )}
    >
      {Platform.OS === "ios" && !!ios?.title && (
        <Text
          variant="footnote"
          className={cn(
            "pb-1 pl-3 text-muted-foreground uppercase",
            ios?.titleClassName
          )}
        >
          {ios.title}
        </Text>
      )}
      {!!materialIconProps && (
        <View className="ios:hidden pt-0.5">
          <Icon
            color={colors.grey}
            size={24}
            {...(materialIconProps as IconProps<"material">)}
          />
        </View>
      )}
      <View className="flex-1">
        <View
          className={cn(
            "gap-4 ios:gap-0 ios:overflow-hidden ios:rounded-lg ios:bg-card ios:pl-1",
            className
          )}
          style={{ borderCurve: "continuous" }}
          {...props}
        >
          {children}
        </View>
        {!!footnote && (
          <Text
            className={cn(
              "ios:pt-1 pt-0.5 ios:pl-3 pl-3 text-muted-foreground",
              footnoteClassName
            )}
            variant="footnote"
          >
            {footnote}
          </Text>
        )}
      </View>
    </View>
  )
}

function FormSeparator(props: ViewProps) {
  if (Platform.OS !== "ios") {
    return null
  }

  return (
    <View
      {...props}
      className={cn("ml-2 h-px flex-1 bg-border", props.className)}
    />
  )
}

function FieldItem({
  className,

  ...props
}: ViewProps) {
  return <View className={cn("ios:pr-1", className)} {...props} />
}

function FieldTextInput(props: ComponentProps<typeof TextField>) {
  const field = useFieldContext()
  const error = field.state.meta.errors[0]
  const message = error && typeof error === "string" ? error : undefined

  return (
    <TextField
      {...props}
      nativeID={field.name}
      value={field.state.value as string | undefined}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
      errorMessage={message}
    />
  )
}

function FormSubmitButton(
  props: ComponentProps<typeof Button> & { loadingText?: string }
) {
  const { loadingText = "Submitting...", children, ...rest } = props
  const form = useFormContext()

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
              <ActivityIndicator
                size="small"
                className="color-muted-foreground"
              />
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

function FieldLeftLabel({ children }: { children: string }) {
  return (
    <View className="w-28 justify-center pl-2">
      <Text className="font-medium">{children}</Text>
    </View>
  )
}

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Item: FieldItem,
    TextInput: FieldTextInput,
    LeftLabel: FieldLeftLabel,
  },
  formComponents: {
    Section: FormSection,
    Separator: FormSeparator,
    SubmitButton: FormSubmitButton,
  },
})
