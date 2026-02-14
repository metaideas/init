import type { ElementType } from "react"
import { cn } from "@init/utils/ui"
import { withUniwind } from "uniwind"

type IconProps = {
  [key: string]: unknown
  as: ElementType
  className?: string
  color?: string
  size?: number
}

function IconImpl({ as: IconComponent, className: _className, ...props }: IconProps) {
  return <IconComponent {...props} />
}

const StyledIcon = withUniwind(IconImpl, {
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
  size: {
    fromClassName: "className",
    styleProperty: "width",
  },
})

function Icon({ as: IconComponent, className, ...props }: IconProps) {
  return (
    <StyledIcon as={IconComponent} className={cn("size-5 text-foreground", className)} {...props} />
  )
}

export { Icon }
