import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Icon } from "#components/icon.tsx"
import { useTheme } from "#components/theme.tsx"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <Icon.CircleCheck className="size-4" />,
        info: <Icon.Info className="size-4" />,
        warning: <Icon.TriangleAlert className="size-4" />,
        error: <Icon.OctagonX className="size-4" />,
        loading: <Icon.Loader className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
