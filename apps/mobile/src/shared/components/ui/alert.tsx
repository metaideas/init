import { useAugmentedRef } from "@rn-primitives/hooks"
import * as Slot from "@rn-primitives/slot"
import type { ComponentRef, ReactNode, Ref } from "react"
import {
  type AlertButton,
  type AlertType,
  type KeyboardType,
  Pressable,
  Alert as RNAlert,
  type View,
} from "react-native"

type AlertRef = ComponentRef<typeof View> & {
  show: () => void
  prompt: (args: AlertProps & { prompt: AlertProps["prompt"] }) => void
  alert: (args: AlertProps) => void
}

type AlertInputValue = { login: string; password: string } | string

type AlertProps = {
  title: string
  buttons: (Omit<AlertButton, "onPress"> & {
    onPress?: (text: AlertInputValue) => void
  })[]
  message?: string | undefined
  prompt?: {
    type?: Exclude<AlertType, "default"> | undefined
    defaultValue?: string | undefined
    keyboardType?: KeyboardType | undefined
  }
  children?: ReactNode
}

function Alert({
  children,
  title,
  buttons,
  message,
  prompt,
  ref,
}: AlertProps & { ref?: Ref<AlertRef> }) {
  const augmentedRef = useAugmentedRef({
    ref: ref ?? null,
    methods: {
      show: () => {
        onPress()
      },
      alert,
      prompt: promptAlert,
    },
    deps: [prompt],
  })

  function promptAlert(args: AlertProps & { prompt: Required<AlertProps["prompt"]> }) {
    RNAlert.prompt(
      args.title,
      args.message,
      args.buttons as AlertButton[],
      args.prompt?.type,
      args.prompt?.defaultValue,
      args.prompt?.keyboardType
    )
  }

  function alert(args: AlertProps) {
    RNAlert.alert(args.title, args.message, args.buttons as AlertButton[])
  }

  function onPress() {
    if (prompt) {
      promptAlert({
        title,
        message,
        buttons,
        prompt: prompt as Required<AlertProps["prompt"]>,
      })
      return
    }
    alert({ title, message, buttons })
  }

  const Component = children ? Slot.Pressable : Pressable

  return (
    <Component onPress={onPress} ref={augmentedRef}>
      {children}
    </Component>
  )
}

function AlertAnchor({ ref }: { ref: Ref<AlertRef> }) {
  return <Alert buttons={[]} ref={ref} title="" />
}

export { Alert, AlertAnchor, type AlertRef }
