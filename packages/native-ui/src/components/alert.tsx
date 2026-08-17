/* eslint-disable react/jsx-no-constructed-context-values -- TextClassContext values are strings; string equality prevents consumer re-renders */
import type { LucideIcon } from "lucide-react-native"
import { cn } from "@init/utils/ui"
import * as React from "react"
import { View } from "react-native"
import { Icon } from "#components/icon.tsx"
import { Text, TextClassContext } from "#components/text.tsx"

function Alert({
  className,
  variant,
  children,
  icon,
  iconClassName,
  ...props
}: React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    icon: LucideIcon
    variant?: "default" | "destructive"
    iconClassName?: string
  }) {
  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm text-foreground",
        variant === "destructive" && "text-destructive",
        className
      )}
    >
      <View
        role="alert"
        className={cn(
          "relative w-full rounded-lg border border-border bg-card px-4 pt-3.5 pb-2",
          className
        )}
        {...props}
      >
        <View className="absolute top-3 left-3.5">
          <Icon
            as={icon}
            className={cn("size-4", variant === "destructive" && "text-destructive", iconClassName)}
          />
        </View>
        {children}
      </View>
    </TextClassContext.Provider>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("mb-1 ml-0.5 min-h-4 pl-6 leading-none font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  const textClass = React.useContext(TextClassContext)
  return (
    <Text
      className={cn(
        "ml-0.5 pb-1.5 pl-6 text-sm leading-relaxed text-muted-foreground",
        textClass?.includes("text-destructive") && "text-destructive/90",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
