import { Stack } from "expo-router"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { useCSSVariable, useUniwind } from "uniwind"
import type {
  LargeTitleHeaderProps,
  NativeStackNavigationOptions,
  NativeStackNavigationSearchBarOptions,
} from "#shared/components/large-title-header/types.ts"
import { isLiquidGlassSupported } from "#shared/utils.ts"

export function LargeTitleHeader(props: LargeTitleHeaderProps) {
  const { theme } = useUniwind()
  const [background, card] = useCSSVariable(["--color-background", "--color-card"])
  const [searchValue, setSearchValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const headerBackground = theme === "dark" ? background : card

  return (
    <>
      <Stack.Screen
        options={propsToScreenOptions(
          props,
          typeof headerBackground === "string" ? headerBackground : undefined,
          setIsFocused,
          setSearchValue
        )}
      />
      {props.searchBar?.content && (isFocused || searchValue.length > 0) ? (
        <Animated.View
          className="z-[99999]"
          entering={FadeIn.duration(500)}
          style={StyleSheet.absoluteFill}
        >
          <View style={StyleSheet.absoluteFill}>{props.searchBar.content}</View>
        </Animated.View>
      ) : null}
    </>
  )
}

function propsToScreenOptions(
  props: LargeTitleHeaderProps,
  backgroundColor: string | undefined,
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
    headerLeft: props.leftView,
    headerRight: props.rightView,
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
          textColor: props.searchBar.textColor,
          tintColor: props.searchBar.iosTintColor,
        }
      : undefined,
    headerShadowVisible: props.shadowVisible,
    headerShown: props.shown,
    headerStyle:
      props.iosBlurEffect === "none"
        ? { backgroundColor: props.backgroundColor ?? backgroundColor }
        : undefined,
    headerTitle: props.title,
    headerTransparent: isLiquidGlassSupported || props.iosBlurEffect !== "none",
    ...props.screen,
  }
}
