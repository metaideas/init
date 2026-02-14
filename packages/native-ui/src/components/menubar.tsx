import { cn } from "@init/utils/ui"
import * as MenubarPrimitive from "@rn-primitives/menubar"
import { Portal } from "@rn-primitives/portal"
import * as React from "react"
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from "react-native"
import { FadeIn } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, Icon } from "./icon"
import { NativeOnlyAnimatedView } from "./native-only-animated-view"
import { TextClassContext } from "./text"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

type MenubarProps = Omit<MenubarPrimitive.RootProps, "onValueChange" | "value"> &
  React.RefAttributes<MenubarPrimitive.RootRef> & {
    onValueChange?: (value?: string) => void
    value?: string
  }

function Menubar({
  className,
  value: valueProp,
  onValueChange: onValueChangeProp,
  ...props
}: MenubarProps) {
  const id = React.useId()
  const [value, setValue] = React.useState<string | undefined>()

  function closeMenu() {
    if (onValueChangeProp) {
      onValueChangeProp()
      return
    }
    setValue(undefined)
  }

  return (
    <>
      {Platform.OS !== "web" && (value || valueProp) ? (
        <Portal name={`menubar-overlay-${id}`}>
          <Pressable onPress={closeMenu} style={StyleSheet.absoluteFill} />
        </Portal>
      ) : null}
      <MenubarPrimitive.Root
        className={cn(
          "flex h-10 flex-row items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm shadow-black/5 sm:h-9",
          className
        )}
        value={value ?? valueProp}
        onValueChange={onValueChangeProp ?? setValue}
        {...props}
      />
    </>
  )
}

function MenubarTrigger({
  className,
  ...props
}: MenubarPrimitive.TriggerProps & React.RefAttributes<MenubarPrimitive.TriggerRef>) {
  const { value } = MenubarPrimitive.useRootContext()
  const { value: itemValue } = MenubarPrimitive.useMenuContext()

  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm font-medium select-none group-active:text-accent-foreground",
        value === itemValue && "text-accent-foreground"
      )}
    >
      <MenubarPrimitive.Trigger
        className={cn(
          "group flex items-center rounded-md px-2 py-1.5 sm:py-1",
          Platform.select({
            web: "focus:bg-accent focus:text-accent-foreground cursor-default outline-none",
          }),
          value === itemValue && "bg-accent",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  iconClassName,
  ...props
}: MenubarPrimitive.SubTriggerProps &
  React.RefAttributes<MenubarPrimitive.SubTriggerRef> & {
    children?: React.ReactNode
    iconClassName?: string
    inset?: boolean
  }) {
  const { open } = MenubarPrimitive.useSubContext()
  const icon = Platform.OS === "web" ? ChevronRightIcon : open ? ChevronUpIcon : ChevronDownIcon
  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm select-none group-active:text-accent-foreground",
        open && "text-accent-foreground"
      )}
    >
      <MenubarPrimitive.SubTrigger
        className={cn(
          "group flex flex-row items-center justify-between rounded-sm px-2 py-2 active:bg-accent sm:py-1.5",
          Platform.select({
            web: "focus:bg-accent focus:text-accent-foreground cursor-default outline-none [&_svg]:pointer-events-none",
          }),
          open && "bg-accent",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
        <Icon as={icon} className={cn("size-4 shrink-0 text-foreground", iconClassName)} />
      </MenubarPrimitive.SubTrigger>
    </TextClassContext.Provider>
  )
}

function MenubarSubContent({
  className,
  ...props
}: MenubarPrimitive.SubContentProps & React.RefAttributes<MenubarPrimitive.SubContentRef>) {
  return (
    <NativeOnlyAnimatedView entering={FadeIn}>
      <MenubarPrimitive.SubContent
        className={cn(
          "overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg shadow-black/5",
          Platform.select({
            web: "animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fade-in-0 data-[state=closed]:zoom-out-95 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin) z-50 min-w-[8rem]",
          }),
          className
        )}
        {...props}
      />
    </NativeOnlyAnimatedView>
  )
}

function MenubarContent({
  className,
  overlayClassName: _overlayClassName,
  overlayStyle: _overlayStyle,
  portalHost,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenubarPrimitive.ContentProps &
  React.RefAttributes<MenubarPrimitive.ContentRef> & {
    overlayStyle?: StyleProp<ViewStyle>
    overlayClassName?: string
    portalHost?: string
  }) {
  return (
    <MenubarPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <NativeOnlyAnimatedView
          entering={FadeIn}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          <TextClassContext.Provider value="text-popover-foreground">
            <MenubarPrimitive.Content
              className={cn(
                "min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg shadow-black/5",
                Platform.select({
                  web: cn(
                    "z-50 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) animate-in cursor-default fade-in-0 zoom-in-95",
                    props.side === "bottom" && "slide-in-from-top-2",
                    props.side === "top" && "slide-in-from-bottom-2"
                  ),
                }),
                className
              )}
              align={align}
              alignOffset={alignOffset}
              sideOffset={sideOffset}
              {...props}
            />
          </TextClassContext.Provider>
        </NativeOnlyAnimatedView>
      </FullWindowOverlay>
    </MenubarPrimitive.Portal>
  )
}

function MenubarItem({
  className,
  inset,
  variant,
  ...props
}: MenubarPrimitive.ItemProps &
  React.RefAttributes<MenubarPrimitive.ItemRef> & {
    className?: string
    inset?: boolean
    variant?: "default" | "destructive"
  }) {
  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm text-popover-foreground select-none group-active:text-popover-foreground",
        variant === "destructive" && "text-destructive group-active:text-destructive"
      )}
    >
      <MenubarPrimitive.Item
        className={cn(
          "group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 active:bg-accent sm:py-1.5",
          Platform.select({
            web: cn(
              "cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none",
              variant === "destructive" && "focus:bg-destructive/10 dark:focus:bg-destructive/20"
            ),
          }),
          variant === "destructive" && "active:bg-destructive/10 dark:active:bg-destructive/20",
          props.disabled && "opacity-50",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function MenubarCheckboxItem({
  className,
  children,
  ...props
}: MenubarPrimitive.CheckboxItemProps &
  React.RefAttributes<MenubarPrimitive.CheckboxItemRef> & {
    children?: React.ReactNode
  }) {
  return (
    <TextClassContext.Provider value="text-sm text-popover-foreground select-none group-active:text-accent-foreground">
      <MenubarPrimitive.CheckboxItem
        className={cn(
          "group relative flex flex-row items-center gap-2 rounded-sm py-2 pr-2 pl-8 active:bg-accent sm:py-1.5",
          Platform.select({
            web: "focus:bg-accent focus:text-accent-foreground cursor-default outline-none data-[disabled]:pointer-events-none",
          }),
          props.disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <MenubarPrimitive.ItemIndicator>
            <Icon
              as={CheckIcon}
              className={cn(
                "size-4 text-foreground",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </MenubarPrimitive.ItemIndicator>
        </View>
        {children}
      </MenubarPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarPrimitive.RadioItemProps &
  React.RefAttributes<MenubarPrimitive.RadioItemRef> & {
    children?: React.ReactNode
  }) {
  return (
    <TextClassContext.Provider value="text-sm text-popover-foreground select-none group-active:text-accent-foreground">
      <MenubarPrimitive.RadioItem
        className={cn(
          "group relative flex flex-row items-center gap-2 rounded-sm py-2 pr-2 pl-8 active:bg-accent sm:py-1.5",
          Platform.select({
            web: "focus:bg-accent focus:text-accent-foreground cursor-default outline-none data-[disabled]:pointer-events-none",
          }),
          props.disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <MenubarPrimitive.ItemIndicator>
            <View className="h-2 w-2 rounded-full bg-foreground" />
          </MenubarPrimitive.ItemIndicator>
        </View>
        {children}
      </MenubarPrimitive.RadioItem>
    </TextClassContext.Provider>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: MenubarPrimitive.LabelProps &
  React.RefAttributes<MenubarPrimitive.LabelRef> & {
    className?: string
    inset?: boolean
  }) {
  return (
    <MenubarPrimitive.Label
      className={cn(
        "px-2 py-2 text-sm font-medium text-foreground sm:py-1.5",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: MenubarPrimitive.SeparatorProps & React.RefAttributes<MenubarPrimitive.SeparatorRef>) {
  return (
    <MenubarPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  )
}

function MenubarShortcut({ className, ...props }: TextProps & React.RefAttributes<Text>) {
  return (
    <Text
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
}
