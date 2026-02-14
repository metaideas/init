import { cn } from "@init/utils/ui"
import { ActivityIndicator as RNActivityIndicator } from "react-native"
import { withUniwind } from "uniwind"

const StyledActivityIndicator = withUniwind(RNActivityIndicator, {
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
})

type ActivityIndicatorProps = React.ComponentProps<typeof RNActivityIndicator> & {
  className?: string
}

function ActivityIndicator({ className, ...props }: ActivityIndicatorProps) {
  return <StyledActivityIndicator className={cn("text-primary", className)} {...props} />
}

export { ActivityIndicator }
export type { ActivityIndicatorProps }
