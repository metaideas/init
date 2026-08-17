/* eslint-disable react/jsx-no-constructed-context-values -- TextClassContext values are strings; string equality prevents consumer re-renders */
/* eslint-disable import/namespace -- oxlint cannot resolve the `export *` re-exports in the @rn-primitives dist bundles */
import type { VariantProps } from "class-variance-authority"
import { cn } from "@init/utils/ui"
import * as ToggleGroupPrimitive from "@rn-primitives/toggle-group"
import * as React from "react"
import { Platform } from "react-native"
import { Icon } from "#components/icon.tsx"
import { TextClassContext } from "#components/text.tsx"
import { toggleVariants } from "#components/toggle.tsx"

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> | null>(null)

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  const contextValue = React.useMemo(() => ({ size, variant }), [size, variant])
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        "flex flex-row items-center rounded-md shadow-none",
        Platform.select({ web: "w-fit" }),
        variant === "outline" && "shadow-sm shadow-black/5",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function useToggleGroupContext() {
  const context = React.useContext(ToggleGroupContext)
  if (context === null) {
    throw new Error(
      "ToggleGroup compound components cannot be rendered outside the ToggleGroup component"
    )
  }
  return context
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  isFirst,
  isLast,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants> & {
    isFirst?: boolean
    isLast?: boolean
  }) {
  const context = useToggleGroupContext()
  const { value } = ToggleGroupPrimitive.useRootContext()
  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm font-medium text-foreground",
        ToggleGroupPrimitive.utils.getIsSelected(value, props.value)
          ? "text-accent-foreground"
          : Platform.select({ web: "group-hover:text-muted-foreground" })
      )}
    >
      <ToggleGroupPrimitive.Item
        className={cn(
          toggleVariants({
            size: context.size ?? size,
            variant: context.variant ?? variant,
          }),
          props.disabled && "opacity-50",
          ToggleGroupPrimitive.utils.getIsSelected(value, props.value) && "bg-accent",
          "min-w-0 shrink-0 rounded-none shadow-none",
          isFirst && "rounded-l-md",
          isLast && "rounded-r-md",
          (context.variant === "outline" || variant === "outline") && "border-l-0",
          (context.variant === "outline" || variant === "outline") && isFirst && "border-l",
          Platform.select({
            web: "flex-1 focus:z-10 focus-visible:z-10",
          }),
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    </TextClassContext.Provider>
  )
}

function ToggleGroupIcon({ className, ...props }: React.ComponentProps<typeof Icon>) {
  const textClass = React.useContext(TextClassContext)
  return <Icon className={cn("size-4 shrink-0", textClass, className)} {...props} />
}

export { ToggleGroup, ToggleGroupIcon, ToggleGroupItem }
