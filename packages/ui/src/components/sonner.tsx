import { toast, Toaster as Sonner, type ToasterProps } from "sonner"
import { Icon } from "#components/icon.tsx"
import { useTheme } from "#components/theme.tsx"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        error: <Icon.OctagonX className="size-4" />,
        info: <Icon.Info className="size-4" />,
        loading: <Icon.Loader className="size-4 animate-spin" />,
        success: <Icon.CircleCheck className="size-4" />,
        warning: <Icon.TriangleAlert className="size-4" />,
      }}
      style={
        {
          "--border-radius": "var(--radius)",
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { toast, Toaster }
