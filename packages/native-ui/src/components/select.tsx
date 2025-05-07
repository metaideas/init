import * as SelectPrimitive from "@rn-primitives/select"
import * as React from "react"
import { Platform, StyleSheet, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

import { cn } from "@init/utils/ui"

import { Check, ChevronDown, ChevronUp } from "./icon"

type Option = SelectPrimitive.Option

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  SelectPrimitive.TriggerRef,
  SelectPrimitive.TriggerProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 native:h-12 flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-muted-foreground text-sm web:ring-offset-background web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 [&>span]:line-clamp-1",
      props.disabled && "web:cursor-not-allowed opacity-50",
      className
    )}
    {...props}
  >
    {({ pressed }) => {
      return (
        <>
          {typeof children === "function" ? children({ pressed }) : children}
          <ChevronDown
            size={16}
            aria-hidden={true}
            className="text-foreground opacity-50"
          />
        </>
      )
    }}
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * Platform: WEB ONLY
 */
const SelectScrollUpButton = ({
  className,
  ...props
}: SelectPrimitive.ScrollUpButtonProps) => {
  if (Platform.OS !== "web") {
    return null
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex web:cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp size={14} className="text-foreground" />
    </SelectPrimitive.ScrollUpButton>
  )
}

/**
 * Platform: WEB ONLY
 */
const SelectScrollDownButton = ({
  className,
  ...props
}: SelectPrimitive.ScrollDownButtonProps) => {
  if (Platform.OS !== "web") {
    return null
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex web:cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown size={14} className="text-foreground" />
    </SelectPrimitive.ScrollDownButton>
  )
}

const SelectContent = React.forwardRef<
  SelectPrimitive.ContentRef,
  SelectPrimitive.ContentProps & { portalHost?: string }
>(({ className, children, position = "popper", portalHost, ...props }, ref) => {
  const { open } = SelectPrimitive.useRootContext()

  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <SelectPrimitive.Overlay
        style={Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined}
      >
        <Animated.View className="z-50" entering={FadeIn} exiting={FadeOut}>
          <SelectPrimitive.Content
            ref={ref}
            className={cn(
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] rounded-md border border-border bg-popover px-1 py-2 shadow-foreground/10 shadow-md",
              position === "popper" &&
                "data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1",
              open
                ? "web:zoom-in-95 web:fade-in-0 web:animate-in"
                : "web:zoom-out-95 web:fade-out-0 web:animate-out",
              className
            )}
            position={position}
            {...props}
          >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
              className={cn(
                "p-1",
                position === "popper" &&
                  "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
              )}
            >
              {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
          </SelectPrimitive.Content>
        </Animated.View>
      </SelectPrimitive.Overlay>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  SelectPrimitive.LabelRef,
  SelectPrimitive.LabelProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-1.5 pr-2 native:pb-2 native:pl-10 pl-8 font-semibold native:text-base text-popover-foreground text-sm",
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  SelectPrimitive.ItemRef,
  SelectPrimitive.ItemProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "web:group relative flex w-full web:cursor-default web:select-none flex-row items-center rounded-sm native:py-2 py-1.5 pr-2 native:pl-10 pl-8 web:outline-none web:hover:bg-accent/50 web:focus:bg-accent active:bg-accent",
      props.disabled && "web:pointer-events-none opacity-50",
      className
    )}
    {...props}
  >
    <View className="absolute left-2 native:left-3.5 flex h-3.5 w-3.5 items-center justify-center native:pt-px">
      <SelectPrimitive.ItemIndicator>
        <Check size={16} strokeWidth={3} className="text-popover-foreground" />
      </SelectPrimitive.ItemIndicator>
    </View>
    <SelectPrimitive.ItemText className="native:text-base native:text-lg text-popover-foreground text-sm web:group-focus:text-accent-foreground" />
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  SelectPrimitive.SeparatorRef,
  SelectPrimitive.SeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
}
