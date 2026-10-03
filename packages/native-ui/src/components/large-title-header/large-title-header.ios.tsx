import type { SearchBarCommands } from "react-native-screens"
import { Stack } from "expo-router"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { useCSSVariable } from "uniwind"
import { useLargeTitleSearch } from "#hooks/use-large-title-search.ts"
import { checkIsLiquidGlassSupported } from "#utils.ts"
import type { LargeTitleHeaderProps, NativeStackNavigationOptions } from "./types"

const isLiquidGlassSupported = checkIsLiquidGlassSupported()

function LargeTitleHeader(props: LargeTitleHeaderProps) {
  const search = useLargeTitleSearch(props.searchBar)
  const nativeSearchBarRef = React.useRef<SearchBarCommands>(null)
  const backgroundValue = useCSSVariable("--color-background")
  const cardValue = useCSSVariable("--color-card")
  const foregroundValue = useCSSVariable("--color-foreground")
  const mutedValue = useCSSVariable("--color-muted-foreground")

  const background = colorVariableToString(backgroundValue)
  const card = colorVariableToString(cardValue) ?? background
  const foreground = colorVariableToString(foregroundValue)
  const mutedForeground = colorVariableToString(mutedValue) ?? foreground

  React.useImperativeHandle(props.searchBar?.ref, () => ({
    cancelSearch: () => nativeSearchBarRef.current?.cancelSearch(),
    clearText: () => nativeSearchBarRef.current?.clearText(),
    focus: () => nativeSearchBarRef.current?.focus(),
    setText: (text) => nativeSearchBarRef.current?.setText(text),
  }))

  const screenOptions = propsToScreenOptions(props, card, foreground, mutedForeground, search)

  return (
    <>
      <Stack.Screen
        options={{
          ...screenOptions,
          headerSearchBarOptions: screenOptions.headerSearchBarOptions && {
            ...screenOptions.headerSearchBarOptions,
            ref: nativeSearchBarRef,
          },
        }}
      />
      {props.searchBar && search.isOverlayShown ? (
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
  search: ReturnType<typeof useLargeTitleSearch>
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
          onBlur: search.blur,
          onCancelButtonPress: props.searchBar.onCancelButtonPress,
          onChangeText: (event) => {
            search.changeText(event.nativeEvent.text)
          },
          onFocus: search.focus,
          onSearchButtonPress: props.searchBar.onSearchButtonPress,
          placeholder: props.searchBar.placeholder ?? "Search...",
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
  return typeof value === "string" ? value : undefined
}

export { LargeTitleHeader }
