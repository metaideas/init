import { cn } from "@init/utils/ui"
import { Platform, TextInput, type TextInputProps } from "react-native"

type InputProps = TextInputProps &
  React.RefAttributes<TextInput> & {
    placeholderClassName?: string
  }

function Input({ className, placeholderClassName: _placeholderClassName, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "flex h-10 w-full min-w-0 flex-row items-center rounded-md border border-input bg-background px-3 py-1 text-base leading-5 text-foreground shadow-sm shadow-black/5 sm:h-9 dark:bg-input/30",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({ web: "disabled:pointer-events-none disabled:cursor-not-allowed" })
          ),
        Platform.select({
          native: "placeholder:text-muted-foreground/50",
          web: cn(
            "transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground md:text-sm",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
          ),
        }),
        className
      )}
      {...props}
    />
  )
}

export { Input }
