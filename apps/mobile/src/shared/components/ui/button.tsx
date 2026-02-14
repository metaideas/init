import type { ComponentProps } from "react"
import { cn } from "@init/utils/ui"
import { Pressable } from "react-native"
import { TextStyleContext } from "#shared/components/ui/text.tsx"

const buttonVariants = {
  plain: "active:opacity-70",
  primary: "bg-primary active:bg-primary/80",
  secondary: "bg-transparent border border-primary active:bg-primary/5 dark:active:bg-primary/15",
  tonal: "bg-primary/10 dark:bg-primary/15 active:bg-primary/15 dark:active:bg-primary/20",
} as const

const buttonSizes = {
  icon: "rounded-lg size-10",
  lg: "rounded-xl gap-2 px-5 py-2.5",
  md: "rounded-lg px-3 py-2",
  sm: "rounded-full px-2.5 py-1",
  xl: "rounded-2xl gap-3 px-8 py-4",
} as const

const buttonTextVariants = {
  plain: "text-foreground",
  primary: "text-white",
  secondary: "text-primary",
  tonal: "text-primary",
} as const

const buttonTextSizes = {
  icon: "",
  lg: "text-base",
  md: "text-base",
  sm: "text-sm",
  xl: "text-lg",
} as const

type ButtonVariant = keyof typeof buttonVariants
type ButtonSize = keyof typeof buttonSizes

function Button({
  style,
  className,
  variant = "primary",
  size = "md",
  ref,
  children,
  ...props
}: ComponentProps<typeof Pressable> & {
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
}) {
  return (
    <TextStyleContext.Provider value={cn(buttonTextVariants[variant], buttonTextSizes[size])}>
      <Pressable
        ref={ref}
        className={cn(
          "flex-row items-center justify-center gap-2 active:scale-[0.98]",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </Pressable>
    </TextStyleContext.Provider>
  )
}

export { Button }
