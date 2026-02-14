import type { ComponentProps, ElementType } from "react"
import Feather from "@expo/vector-icons/Feather"
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

type FeatherIconProps = Omit<ComponentProps<typeof Feather>, "name">

const CheckIcon = (props: FeatherIconProps) => <Feather name="check" {...props} />

const ChevronLeftIcon = (props: FeatherIconProps) => <Feather name="chevron-left" {...props} />

const ChevronDownIcon = (props: FeatherIconProps) => <Feather name="chevron-down" {...props} />

const ChevronRightIcon = (props: FeatherIconProps) => <Feather name="chevron-right" {...props} />

const ChevronUpIcon = (props: FeatherIconProps) => <Feather name="chevron-up" {...props} />

const SearchIcon = (props: FeatherIconProps) => <Feather name="search" {...props} />

const XIcon = (props: FeatherIconProps) => <Feather name="x" {...props} />

export {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Icon,
  SearchIcon,
  XIcon,
}
