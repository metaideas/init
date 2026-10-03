import * as React from "react"

function useMenubarValue(
  valueProp: string | undefined,
  onValueChangeProp: ((value?: string) => void) | undefined
) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>()

  return {
    close: () => {
      if (onValueChangeProp) {
        onValueChangeProp()
        return
      }
      setUncontrolledValue(undefined)
    },
    isOpen: Boolean(uncontrolledValue) || Boolean(valueProp),
    onValueChange: onValueChangeProp ?? setUncontrolledValue,
    value: uncontrolledValue ?? valueProp,
  }
}

export { useMenubarValue }
