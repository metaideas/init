import { Stack } from "expo-router"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { useCSSVariable } from "uniwind"
import type {
  LargeTitleHeaderProps,
  NativeStackNavigationOptions,
  NativeStackNavigationSearchBarOptions,
} from "./types"
import { checkIsLiquidGlassSupported } from "../../utils"

const isLiquidGlassSupported = checkIsLiquidGlassSupported()

function LargeTitleHeader(props: LargeTitleHeaderProps) {
  const [searchValue, setSearchValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const backgroundValue = useCSSVariable("--color-background")
  const cardValue = useCSSVariable("--color-card")
  const foregroundValue = useCSSVariable("--color-foreground")
  const mutedValue = useCSSVariable("--color-muted-foreground")

  const background = colorVariableToString(backgroundValue)
  const card = colorVariableToString(cardValue) ?? background
  const foreground = colorVariableToString(foregroundValue)
  const mutedForeground = colorVariableToString(mutedValue) ?? foreground

  return (
    <>
      <Stack.Screen
        options={propsToScreenOptions(
          props,
          card,
          foreground,
          mutedForeground,
          setIsFocused,
          setSearchValue
        )}
      />
      {props.searchBar?.content && (isFocused || searchValue.length > 0) ? (
        <Animated.View
          entering={FadeIn.delay(100).duration(200)}
          exiting={FadeOut}
          style={[StyleSheet.absoluteFill, { zIndex: 99_999 }]}
        >
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={StyleSheet.absoluteFill}>
            {props.searchBar.content}
          </Animated.View>
        </Animated.View>
      ) : null}
    </>
  )
}

function propsToScreenOptions(
  props: LargeTitleHeaderProps,
  backgroundColor: string | undefined,
  foregroundColor: string | undefined,
  mutedForegroundColor: string | undefined,
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>,
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
): NativeStackNavigationOptions {
  return {
    headerBackButtonMenuEnabled: props.iosBackButtonMenuEnabled,
    headerBackTitle: props.iosBackButtonTitle,
    headerBackVisible: props.backVisible,
    headerBlurEffect: isLiquidGlassSupported
      ? undefined
      : props.iosBlurEffect === "none"
        ? undefined
        : (props.iosBlurEffect ?? "systemMaterial"),
    headerLargeStyle: isLiquidGlassSupported
      ? undefined
      : { backgroundColor: props.backgroundColor ?? backgroundColor },
    headerLargeTitle: true,
    headerLargeTitleShadowVisible: props.shadowVisible,
    headerLargeTitleStyle: foregroundColor ? { color: foregroundColor } : undefined,
    headerLeft: props.leftView
      ? (headerProps) => (
          <View className="flex-row justify-center gap-4">{props.leftView?.(headerProps)}</View>
        )
      : undefined,
    headerRight: props.rightView
      ? (headerProps) => (
          <View className="flex-row justify-center gap-4">{props.rightView?.(headerProps)}</View>
        )
      : undefined,
    headerSearchBarOptions: props.searchBar
      ? {
          autoCapitalize: props.searchBar.autoCapitalize,
          cancelButtonText: props.searchBar.iosCancelButtonText,
          hideWhenScrolling: props.searchBar.iosHideWhenScrolling ?? false,
          inputType: props.searchBar.inputType,
          onBlur: () => {
            setIsFocused(false)
            props.searchBar?.onBlur?.()
          },
          onCancelButtonPress: props.searchBar.onCancelButtonPress,
          onChangeText: (event) => {
            const text = event.nativeEvent.text
            setSearchValue(text)
            props.searchBar?.onChangeText?.(text)
          },
          onFocus: () => {
            setIsFocused(true)
            props.searchBar?.onFocus?.()
          },
          onSearchButtonPress: props.searchBar.onSearchButtonPress,
          placeholder: props.searchBar.placeholder ?? "Search...",
          // SAFETY: The native search bar writes the full command set to a ref that exposes a safe subset.
          ref: props.searchBar.ref as NativeStackNavigationSearchBarOptions["ref"],
          textColor: props.searchBar.textColor ?? foregroundColor,
          tintColor: props.searchBar.iosTintColor ?? mutedForegroundColor,
        }
      : undefined,
    headerShadowVisible: props.shadowVisible,
    headerShown: props.shown,
    headerStyle:
      props.iosBlurEffect === "none"
        ? { backgroundColor: props.backgroundColor ?? backgroundColor }
        : undefined,
    headerTintColor: foregroundColor,
    headerTitle: props.title,
    headerTitleStyle: foregroundColor ? { color: foregroundColor } : undefined,
    headerTransparent: isLiquidGlassSupported ? true : props.iosBlurEffect !== "none",
    ...props.screen,
  }
}

function colorVariableToString(value: string | number | undefined): string | undefined {
  if (value?.constructor === Number) return undefined

  // SAFETY: Uniwind returns only strings, numbers, or undefined, and the numeric case exits above.
  return value as string | undefined
}

export { LargeTitleHeader }
