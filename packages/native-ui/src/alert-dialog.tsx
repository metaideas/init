import * as AlertDialogPrimitive from "@rn-primitives/alert-dialog"
import * as React from "react"
import { Platform, StyleSheet, View, type ViewProps } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

import { cn } from "@this/utils/classname"

import { buttonTextVariants, buttonVariants } from "./button"
import { TextClassContext } from "./text"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlayWeb = React.forwardRef<
  AlertDialogPrimitive.OverlayRef,
  AlertDialogPrimitive.OverlayProps
>(({ className, ...props }, ref) => {
  const { open } = AlertDialogPrimitive.useRootContext()
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "absolute top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/80 p-2",
        open
          ? "web:fade-in-0 web:animate-in"
          : "web:fade-out-0 web:animate-out",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

AlertDialogOverlayWeb.displayName = "AlertDialogOverlayWeb"

const AlertDialogOverlayNative = React.forwardRef<
  AlertDialogPrimitive.OverlayRef,
  AlertDialogPrimitive.OverlayProps
>(({ className, children, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Overlay
      style={StyleSheet.absoluteFill}
      className={cn(
        "z-50 flex items-center justify-center bg-black/80 p-2",
        className
      )}
      {...props}
      ref={ref}
      asChild
    >
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
      >
        {children}
      </Animated.View>
    </AlertDialogPrimitive.Overlay>
  )
})

AlertDialogOverlayNative.displayName = "AlertDialogOverlayNative"

const AlertDialogOverlay = Platform.select({
  web: AlertDialogOverlayWeb,
  default: AlertDialogOverlayNative,
})

const AlertDialogContent = React.forwardRef<
  AlertDialogPrimitive.ContentRef,
  AlertDialogPrimitive.ContentProps & { portalHost?: string }
>(({ className, portalHost, ...props }, ref) => {
  const { open } = AlertDialogPrimitive.useRootContext()

  return (
    <AlertDialogPortal hostName={portalHost}>
      <AlertDialogOverlay>
        <AlertDialogPrimitive.Content
          ref={ref}
          className={cn(
            "z-50 max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-foreground/10 shadow-lg web:duration-200",
            open
              ? "web:fade-in-0 web:zoom-in-95 web:animate-in"
              : "web:fade-out-0 web:zoom-out-95 web:animate-out",
            className
          )}
          {...props}
        />
      </AlertDialogOverlay>
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({ className, ...props }: ViewProps) => (
  <View className={cn("flex flex-col gap-2", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }: ViewProps) => (
  <View
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  AlertDialogPrimitive.TitleRef,
  AlertDialogPrimitive.TitleProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-semibold native:text-xl text-foreground text-lg",
      className
    )}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  AlertDialogPrimitive.DescriptionRef,
  AlertDialogPrimitive.DescriptionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("native:text-base text-muted-foreground text-sm", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  AlertDialogPrimitive.ActionRef,
  AlertDialogPrimitive.ActionProps
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value={buttonTextVariants({ className })}>
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(buttonVariants(), className)}
      {...props}
    />
  </TextClassContext.Provider>
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  AlertDialogPrimitive.CancelRef,
  AlertDialogPrimitive.CancelProps
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider
    value={buttonTextVariants({ className, variant: "outline" })}
  >
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(buttonVariants({ variant: "outline", className }))}
      {...props}
    />
  </TextClassContext.Provider>
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
