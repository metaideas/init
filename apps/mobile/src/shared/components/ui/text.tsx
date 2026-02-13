import { cn } from "@init/utils/ui"
import { createContext, useContext } from "react"
import { Text as RNText, type TextProps } from "react-native"

const textVariants = {
  body: "text-base leading-6",
  callout: "text-base leading-6",
  caption1: "text-xs leading-4",
  caption2: "text-xs leading-4",
  footnote: "text-xs leading-4",
  heading: "text-base font-semibold leading-6",
  largeTitle: "text-4xl font-bold leading-10",
  subhead: "text-sm font-medium leading-5",
  title1: "text-2xl leading-8",
  title2: "text-xl leading-7",
  title3: "text-xl leading-7",
} as const

const textColors = {
  primary: "text-foreground",
  quaternary: "text-grey-3/50",
  secondary: "text-foreground/90",
  tertiary: "text-grey-3",
} as const

type TextVariant = keyof typeof textVariants
type TextColor = keyof typeof textColors

const TextStyleContext = createContext<string | undefined>(undefined)

function Text({
  variant = "body",
  color = "primary",
  children,
  className,
  ...props
}: TextProps & { className?: string; color?: TextColor; variant?: TextVariant }) {
  const contextClassName = useContext(TextStyleContext)

  return (
    <RNText
      className={cn(textVariants[variant], textColors[color], contextClassName, className)}
      {...props}
    >
      {children}
    </RNText>
  )
}

export { Text, TextStyleContext }
