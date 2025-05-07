import * as DialogPrimitive from "@rn-primitives/dialog"
import * as React from "react"
import { Platform, StyleSheet, View, type ViewProps } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

import { cn } from "@init/utils/ui"

import { X } from "./icon"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlayWeb = React.forwardRef<
  DialogPrimitive.OverlayRef,
  DialogPrimitive.OverlayProps
>(({ className, ...props }, ref) => {
  const { open } = DialogPrimitive.useRootContext()
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/80 p-2",
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

DialogOverlayWeb.displayName = "DialogOverlayWeb"

const DialogOverlayNative = React.forwardRef<
  DialogPrimitive.OverlayRef,
  DialogPrimitive.OverlayProps
>(({ className, children, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      style={StyleSheet.absoluteFill}
      className={cn(
        "flex items-center justify-center bg-black/80 p-2",
        className
      )}
      {...props}
      ref={ref}
    >
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
      >
        {children}
      </Animated.View>
    </DialogPrimitive.Overlay>
  )
})

DialogOverlayNative.displayName = "DialogOverlayNative"

const DialogOverlay = Platform.select({
  web: DialogOverlayWeb,
  default: DialogOverlayNative,
})

const DialogContent = React.forwardRef<
  DialogPrimitive.ContentRef,
  DialogPrimitive.ContentProps & { portalHost?: string }
>(({ className, children, portalHost, ...props }, ref) => {
  const { open } = DialogPrimitive.useRootContext()
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "max-w-lg web:cursor-default gap-4 rounded-lg border border-border bg-background p-6 shadow-lg web:duration-200",
            open
              ? "web:fade-in-0 web:zoom-in-95 web:animate-in"
              : "web:fade-out-0 web:zoom-out-95 web:animate-out",
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close
            className=
              "web:group absolute top-4 right-4 rounded-sm p-0.5 opacity-70 web:ring-offset-background web:transition-opacity web:hover:opacity-100 web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 web:disabled:pointer-events-none"
          >
            <X
              size={Platform.OS === "web" ? 16 : 18}
              className={cn(
                "text-muted-foreground",
                open && "text-accent-foreground"
              )}
            />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: ViewProps) => (
  <View
    className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: ViewProps) => (
  <View
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  DialogPrimitive.TitleRef,
  DialogPrimitive.TitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-semibold native:text-xl text-foreground text-lg leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  DialogPrimitive.DescriptionRef,
  DialogPrimitive.DescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("native:text-base text-muted-foreground text-sm", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
