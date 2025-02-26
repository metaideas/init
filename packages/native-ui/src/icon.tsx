import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  type LucideIcon,
  X,
} from "lucide-react-native"
import { cssInterop } from "nativewind"

function iconWithClassName(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  })
}

iconWithClassName(Check)
iconWithClassName(ChevronDown)
iconWithClassName(ChevronRight)
iconWithClassName(ChevronUp)
iconWithClassName(X)

export { ChevronDown, Check, ChevronRight, ChevronUp, X }
