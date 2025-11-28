import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "./theme"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      theme={theme}
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
