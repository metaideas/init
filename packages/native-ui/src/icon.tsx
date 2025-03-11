import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react-native"
import { cssInterop } from "nativewind"

for (const icon of [Check, ChevronDown, ChevronRight, ChevronUp, Loader2, X]) {
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

export { ChevronDown, Check, ChevronRight, ChevronUp, X, Loader2 }
