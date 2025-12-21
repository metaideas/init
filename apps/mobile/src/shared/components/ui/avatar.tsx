import * as AvatarPrimitive from "@rn-primitives/avatar"
import type { Ref } from "react"
import { StyleSheet } from "react-native-unistyles"

const styles = StyleSheet.create((theme) => ({
  avatar: {
    position: "relative",
    height: theme.spacing[10],
    width: theme.spacing[10],
    shrink: 0,
    overflow: "hidden",
    rounded: theme.borderRadius.full,
  },
  image: {
    aspectRatio: 1,
    height: "100%",
    width: "100%",
  },
  fallback: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    rounded: theme.borderRadius.full,
    backgroundColor: theme.colors.grey6,
  },
}))

function Avatar({
  style,
  ...props
}: AvatarPrimitive.RootProps & { ref: Ref<AvatarPrimitive.RootRef> }) {
  return <AvatarPrimitive.Root style={[styles.avatar, style]} {...props} />
}

function AvatarImage({
  style,
  ...props
}: AvatarPrimitive.ImageProps & { ref?: Ref<AvatarPrimitive.ImageRef> }) {
  return <AvatarPrimitive.Image style={[styles.image, style]} {...props} />
}

function AvatarFallback({
  style,
  ...props
}: AvatarPrimitive.FallbackProps & { ref?: Ref<AvatarPrimitive.FallbackRef> }) {
  return <AvatarPrimitive.Fallback style={[styles.fallback, style]} {...props} />
}

export { Avatar, AvatarImage, AvatarFallback }
