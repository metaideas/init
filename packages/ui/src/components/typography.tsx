import type React from "react"

import { cn } from "@init/utils/ui"

function TypographyH1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    />
  )
}
TypographyH1.displayName = "TypographyH1"

function TypographyH2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0",
        className
      )}
      {...props}
    />
  )
}
TypographyH2.displayName = "TypographyH2"

function TypographyH3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 font-semibold text-2xl tracking-tight",
        className
      )}
      {...props}
    />
  )
}
TypographyH3.displayName = "TypographyH3"

function TypographyH4({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 font-semibold text-xl tracking-tight",
        className
      )}
      {...props}
    />
  )
}
TypographyH4.displayName = "TypographyH4"

function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("not-first:mt-6 leading-7", className)} {...props} />
}
TypographyP.displayName = "TypographyP"

function TypographyBlockquote({
  className,
  ...props
}: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  )
}
TypographyBlockquote.displayName = "TypographyBlockquote"

function TypographyList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  )
}
TypographyList.displayName = "TypographyList"

function TypographyInlineCode({
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
        className
      )}
      {...props}
    />
  )
}
TypographyInlineCode.displayName = "TypographyInlineCode"

function TypographyLead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)} {...props} />
  )
}
TypographyLead.displayName = "TypographyLead"

function TypographyLarge({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-semibold text-lg", className)} {...props} />
}
TypographyLarge.displayName = "TypographyLarge"

function TypographySmall({
  className,
  ...props
}: React.ComponentProps<"small">) {
  return (
    <small
      className={cn("font-medium text-sm leading-none", className)}
      {...props}
    />
  )
}
TypographySmall.displayName = "TypographySmall"

function TypographyMuted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  )
}
TypographyMuted.displayName = "TypographyMuted"

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyList,
  TypographyInlineCode,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
}
