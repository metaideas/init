import { cn } from "@init/utils/ui"
import * as Slot from "@rn-primitives/slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Platform, type Role, Text as RNText } from "react-native"

const textVariants = cva(
  cn(
    "text-base text-foreground",
    Platform.select({
      web: "select-text",
    })
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        blockquote: "mt-4 border-l-2 border-border pl-3 italic sm:mt-6 sm:pl-6",
        code: "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        default: "",
        h1: cn(
          "text-center text-4xl font-extrabold tracking-tight",
          Platform.select({ web: "scroll-m-20 text-balance" })
        ),
        h2: cn(
          "border-b border-border pb-2 text-3xl font-semibold tracking-tight",
          Platform.select({ web: "scroll-m-20 first:mt-0" })
        ),
        h3: cn("text-2xl font-semibold tracking-tight", Platform.select({ web: "scroll-m-20" })),
        h4: cn("text-xl font-semibold tracking-tight", Platform.select({ web: "scroll-m-20" })),
        large: "text-lg font-semibold",
        lead: "text-muted-foreground text-xl",
        muted: "text-muted-foreground text-sm",
        p: "mt-3 leading-7 sm:mt-6",
        small: "text-sm font-medium leading-none",
      },
    },
  }
)

type TextVariantProps = VariantProps<typeof textVariants>
type TextVariant = NonNullable<TextVariantProps["variant"]>

const ROLE: Partial<Record<TextVariant, Role>> = {
  blockquote: Platform.select({ web: "blockquote" as Role }),
  code: Platform.select({ web: "code" as Role }),
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
}

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
}

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  asChild = false,
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean
  }) {
  const resolvedVariant: TextVariant = variant ?? "default"
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot.Text : RNText

  return (
    <Component
      className={cn(textVariants({ variant: resolvedVariant }), textClass, className)}
      role={resolvedVariant ? ROLE[resolvedVariant] : undefined}
      aria-level={resolvedVariant ? ARIA_LEVEL[resolvedVariant] : undefined}
      {...props}
    />
  )
}

export { Text, TextClassContext }
