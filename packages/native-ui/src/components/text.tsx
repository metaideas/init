import { cn } from "@init/utils/ui"
import { Slot } from "@rn-primitives/slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Platform, Text as RNText, type Role } from "react-native"

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
        code: cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
        ),
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

// SAFETY: React Native for Web supports the blockquote role although the native Role type omits it.
const WEB_BLOCKQUOTE_ROLE = "blockquote" as Role
// SAFETY: React Native for Web supports the code role although the native Role type omits it.
const WEB_CODE_ROLE = "code" as Role

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  className,
  asChild = false,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RNText> &
  React.RefAttributes<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean
  }) {
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot : RNText
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={roleForVariant(variant)}
      aria-level={ariaLevelForVariant(variant)}
      {...props}
    />
  )
}

function roleForVariant(variant: TextVariant | null | undefined): Role | undefined {
  switch (variant) {
    case "blockquote":
      return Platform.OS === "web" ? WEB_BLOCKQUOTE_ROLE : undefined
    case "code":
      return Platform.OS === "web" ? WEB_CODE_ROLE : undefined
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return "heading"
    default:
      return undefined
  }
}

function ariaLevelForVariant(variant: TextVariant | null | undefined): string | undefined {
  switch (variant) {
    case "h1":
      return "1"
    case "h2":
      return "2"
    case "h3":
      return "3"
    case "h4":
      return "4"
    default:
      return undefined
  }
}

export { Text, TextClassContext }
