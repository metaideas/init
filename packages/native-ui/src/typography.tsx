import * as Slot from "@rn-primitives/slot"
import type { SlottableTextProps, TextRef } from "@rn-primitives/types"
import * as React from "react"
import { Platform, Text as RNText } from "react-native"

import { cn } from "@this/utils/classname"

const H1 = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        role="heading"
        aria-level="1"
        className={cn(
          "web:select-text web:scroll-m-20 font-extrabold text-4xl text-foreground tracking-tight lg:text-5xl",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

H1.displayName = "H1"

const H2 = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        role="heading"
        aria-level="2"
        className={cn(
          "web:select-text web:scroll-m-20 border-border border-b pb-2 font-semibold text-3xl text-foreground tracking-tight first:mt-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

H2.displayName = "H2"

const H3 = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        role="heading"
        aria-level="3"
        className={cn(
          "web:select-text web:scroll-m-20 font-semibold text-2xl text-foreground tracking-tight",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

H3.displayName = "H3"

const H4 = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        role="heading"
        aria-level="4"
        className={cn(
          "web:select-text web:scroll-m-20 font-semibold text-foreground text-xl tracking-tight",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

H4.displayName = "H4"

const P = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        className={cn("web:select-text text-base text-foreground", className)}
        ref={ref}
        {...props}
      />
    )
  }
)

P.displayName = "P"

const BlockQuote = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        // @ts-ignore - role of blockquote renders blockquote element on the web
        role={Platform.OS === "web" ? "blockquote" : undefined}
        className={cn(
          "mt-6 native:mt-4 web:select-text border-border border-l-2 native:pl-3 pl-6 text-base text-foreground italic",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

BlockQuote.displayName = "BlockQuote"

const Code = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        // @ts-ignore - role of code renders code element on the web
        role={Platform.OS === "web" ? "code" : undefined}
        className={cn(
          "relative web:select-text rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-semibold text-foreground text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Code.displayName = "Code"

const Lead = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        className={cn(
          "web:select-text text-muted-foreground text-xl",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Lead.displayName = "Lead"

const Large = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        className={cn(
          "web:select-text font-semibold text-foreground text-xl",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Large.displayName = "Large"

const Small = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        className={cn(
          "web:select-text font-medium text-foreground text-sm leading-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Small.displayName = "Small"

const Muted = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot.Text : RNText
    return (
      <Component
        className={cn(
          "web:select-text text-muted-foreground text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Muted.displayName = "Muted"

export { BlockQuote, Code, H1, H2, H3, H4, Large, Lead, Muted, P, Small }
