import type { Ref } from "react"
import * as AvatarPrimitive from "@rn-primitives/avatar"
import { StyleSheet } from "react-native-unistyles"

const styles = StyleSheet.create((theme) => ({
  avatar: {
    height: theme.spacing[10],
    overflow: "hidden",
    position: "relative",
    rounded: theme.borderRadius.full,
    shrink: 0,
    width: theme.spacing[10],
  },
  fallback: {
    alignItems: "center",
    backgroundColor: theme.colors.grey6,
    height: "100%",
    justifyContent: "center",
    rounded: theme.borderRadius.full,
    width: "100%",
  },
  image: {
    aspectRatio: 1,
    height: "100%",
    width: "100%",
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
