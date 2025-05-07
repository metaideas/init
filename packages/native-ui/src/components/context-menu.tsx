import * as ContextMenuPrimitive from "@rn-primitives/context-menu"
import * as React from "react"
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from "react-native"

import { cn } from "@init/utils/ui"

import { Check, ChevronDown, ChevronRight, ChevronUp } from "./icon"
import { TextClassContext } from "./text"

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  ContextMenuPrimitive.SubTriggerRef,
  ContextMenuPrimitive.SubTriggerProps & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => {
  const { open } = ContextMenuPrimitive.useSubContext()
  const Icon =
    Platform.OS === "web" ? ChevronRight : open ? ChevronUp : ChevronDown
  return (
    <TextClassContext.Provider
      value={cn(
        "select-none text-sm native:text-lg text-primary",
        open && "native:text-accent-foreground"
      )}
    >
      <ContextMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
          "flex web:cursor-default web:select-none flex-row items-center gap-2 rounded-sm px-2 native:py-2 py-1.5 web:outline-none web:hover:bg-accent web:focus:bg-accent active:bg-accent",
          open && "bg-accent",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
        <Icon size={18} className="ml-auto text-foreground" />
      </ContextMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  )
})
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  ContextMenuPrimitive.SubContentRef,
  ContextMenuPrimitive.SubContentProps
>(({ className, ...props }, ref) => {
  const { open } = ContextMenuPrimitive.useSubContext()
  return (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-foreground/5 shadow-md",
        open
          ? "web:fade-in-0 web:zoom-in-95 web:animate-in"
          : "web:fade-out-0 web:zoom-out web:animate-out",
        className
      )}
      {...props}
    />
  )
})
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef<
  ContextMenuPrimitive.ContentRef,
  ContextMenuPrimitive.ContentProps & {
    overlayStyle?: StyleProp<ViewStyle>
    overlayClassName?: string
    portalHost?: string
  }
>(
  (
    { className, overlayClassName, overlayStyle, portalHost, ...props },
    ref
  ) => {
    const { open } = ContextMenuPrimitive.useRootContext()
    return (
      <ContextMenuPrimitive.Portal hostName={portalHost}>
        <ContextMenuPrimitive.Overlay
          style={
            overlayStyle
              ? StyleSheet.flatten([
                  Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined,
                  overlayStyle,
                ])
              : Platform.OS !== "web"
                ? StyleSheet.absoluteFill
                : undefined
          }
          className={overlayClassName}
        >
          <ContextMenuPrimitive.Content
            ref={ref}
            className={cn(
              "web:data-[side=bottom]:slide-in-from-top-2 web:data-[side=left]:slide-in-from-right-2 web:data-[side=right]:slide-in-from-left-2 web:data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-foreground/5 shadow-md",
              open
                ? "web:fade-in-0 web:zoom-in-95 web:animate-in"
                : "web:fade-out-0 web:zoom-out-95 web:animate-out",
              className
            )}
            {...props}
          />
        </ContextMenuPrimitive.Overlay>
      </ContextMenuPrimitive.Portal>
    )
  }
)
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  ContextMenuPrimitive.ItemRef,
  ContextMenuPrimitive.ItemProps & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <TextClassContext.Provider value="select-none text-sm native:text-lg text-popover-foreground web:group-focus:text-accent-foreground">
    <ContextMenuPrimitive.Item
      ref={ref}
      className={cn(
        "group relative flex web:cursor-default flex-row items-center gap-2 rounded-sm px-2 native:py-2 py-1.5 web:outline-none web:hover:bg-accent web:focus:bg-accent active:bg-accent",
        inset && "pl-8",
        props.disabled && "web:pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  </TextClassContext.Provider>
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef<
  ContextMenuPrimitive.CheckboxItemRef,
  ContextMenuPrimitive.CheckboxItemProps
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "web:group relative flex web:cursor-default flex-row items-center rounded-sm native:py-2 py-1.5 pr-2 pl-8 web:outline-none web:focus:bg-accent active:bg-accent",
      props.disabled && "web:pointer-events-none opacity-50",
      className
    )}
    {...props}
  >
    <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check size={14} strokeWidth={3} className="text-foreground" />
      </ContextMenuPrimitive.ItemIndicator>
    </View>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  ContextMenuPrimitive.RadioItemRef,
  ContextMenuPrimitive.RadioItemProps
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "web:group relative flex web:cursor-default flex-row items-center rounded-sm native:py-2 py-1.5 pr-2 pl-8 web:outline-none web:focus:bg-accent active:bg-accent",
      props.disabled && "web:pointer-events-none opacity-50",
      className
    )}
    {...props}
  >
    <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <View className="h-2 w-2 rounded-full bg-foreground" />
      </ContextMenuPrimitive.ItemIndicator>
    </View>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef<
  ContextMenuPrimitive.LabelRef,
  ContextMenuPrimitive.LabelProps & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "web:cursor-default px-2 py-1.5 font-semibold native:text-base text-foreground text-sm",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  ContextMenuPrimitive.SeparatorRef,
  ContextMenuPrimitive.SeparatorProps
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({ className, ...props }: TextProps) => {
  return (
    <Text
      className={cn(
        "ml-auto native:text-sm text-muted-foreground text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
}
