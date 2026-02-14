import type { ReactNode } from "react"
import { Stack } from "expo-router"
import * as React from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { useCSSVariable } from "uniwind"
import type { LargeTitleHeaderProps, NativeStackNavigationSearchBarOptions } from "./types"

function LargeTitleHeader(props: LargeTitleHeaderProps) {
  const [searchValue, setSearchValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [showSearchBar, setShowSearchBar] = React.useState(false)

  const backgroundValue = useCSSVariable("--color-background")
  const cardValue = useCSSVariable("--color-card")
  const foregroundValue = useCSSVariable("--color-foreground")
  const inputValue = useCSSVariable("--color-input")
  const primaryValue = useCSSVariable("--color-primary")
  const borderValue = useCSSVariable("--color-border")
  const mutedValue = useCSSVariable("--color-muted-foreground")

  const background = typeof backgroundValue === "string" ? backgroundValue : undefined
  const card = typeof cardValue === "string" ? cardValue : background
  const foreground = typeof foregroundValue === "string" ? foregroundValue : undefined
  const borderColor = typeof borderValue === "string" ? borderValue : undefined
  const input = typeof inputValue === "string" ? inputValue : borderColor
  const primary = typeof primaryValue === "string" ? primaryValue : foreground
  const muted = typeof mutedValue === "string" ? mutedValue : undefined

  const canShowOverlay = Boolean(props.searchBar?.content) && (isFocused || searchValue.length > 0)
  const isInline = props.materialPreset === "inline"
  const searchBarRef = props.searchBar?.ref
  const handleSubmitEditing = props.searchBar?.materialOnSubmitEditing
  const onChangeText = props.searchBar?.onChangeText

  React.useEffect(() => {
    if (!searchBarRef) return

    searchBarRef.current = {
      cancelSearch: () => {
        setShowSearchBar(false)
        setSearchValue("")
        onChangeText?.("")
      },
      clearText: () => {
        setSearchValue("")
        onChangeText?.("")
      },
      focus: () => {
        setShowSearchBar(true)
      },
      setText: (text) => {
        setSearchValue(text)
        onChangeText?.(text)
      },
    }

    return () => {
      searchBarRef.current = null
    }
  }, [onChangeText, searchBarRef])

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          ...props.screen,
        }}
      />
      <View
        className="px-4 pt-3 pb-4"
        style={{
          backgroundColor: props.backgroundColor ?? card,
          borderBottomColor: borderColor,
          borderBottomWidth: props.shadowVisible ? StyleSheet.hairlineWidth : 0,
        }}
      >
        <View className="min-h-11 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            {renderHeaderView(props.leftView, foreground)}
            {isInline ? (
              <Text
                numberOfLines={1}
                className={
                  props.materialTitleClassName ?? "pl-3 text-2xl font-semibold text-foreground"
                }
              >
                {props.title}
              </Text>
            ) : null}
          </View>
          <View className="flex-row items-center gap-3">
            {props.searchBar ? (
              <Text
                className="text-base font-medium"
                style={{ color: primary }}
                onPress={() => {
                  setShowSearchBar(true)
                  props.searchBar?.onSearchButtonPress?.()
                }}
              >
                Search
              </Text>
            ) : null}
            {renderHeaderView(props.rightView, foreground)}
          </View>
        </View>
        {isInline ? null : (
          <View className="pt-5">
            <Text
              className={props.materialTitleClassName ?? "text-4xl font-bold text-foreground"}
              numberOfLines={1}
            >
              {props.title}
            </Text>
          </View>
        )}
      </View>
      {props.searchBar && showSearchBar ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 z-[99999]">
          <View
            className="px-4 pt-6 pb-3"
            style={{ backgroundColor: props.backgroundColor ?? background }}
          >
            <View
              className="flex-row items-center rounded-full px-4 py-2"
              style={{
                backgroundColor: input,
                borderColor,
                borderWidth: StyleSheet.hairlineWidth,
              }}
            >
              <TextInput
                autoCapitalize={props.searchBar.autoCapitalize}
                blurOnSubmit={props.searchBar.materialBlurOnSubmit}
                className="flex-1 text-base text-foreground"
                keyboardType={searchBarInputTypeToKeyboardType(props.searchBar.inputType)}
                onBlur={() => {
                  setIsFocused(false)
                  if (searchValue.length === 0) setShowSearchBar(false)
                  props.searchBar?.onBlur?.()
                }}
                onChangeText={(text) => {
                  setSearchValue(text)
                  props.searchBar?.onChangeText?.(text)
                }}
                onFocus={() => {
                  setIsFocused(true)
                  props.searchBar?.onFocus?.()
                }}
                onSubmitEditing={handleSubmitEditing}
                placeholder={props.searchBar.placeholder ?? "Search..."}
                placeholderTextColor={muted}
                returnKeyType="search"
                style={{ color: props.searchBar.textColor ?? foreground }}
                value={searchValue}
              />
              {searchValue.length > 0 ? (
                <Text
                  className="pl-3 text-sm font-medium"
                  style={{ color: primary }}
                  onPress={() => {
                    setSearchValue("")
                    props.searchBar?.onChangeText?.("")
                    props.searchBar?.onCancelButtonPress?.()
                  }}
                >
                  Clear
                </Text>
              ) : null}
            </View>
          </View>
          <View className="flex-1">{props.searchBar.content}</View>
        </Animated.View>
      ) : null}
      {canShowOverlay ? (
        <Animated.View
          entering={FadeIn.delay(100).duration(200)}
          exiting={FadeOut}
          style={[StyleSheet.absoluteFill, { zIndex: 99_998 }]}
        >
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={StyleSheet.absoluteFill}>
            {props.searchBar?.content}
          </Animated.View>
        </Animated.View>
      ) : null}
    </>
  )
}

function renderHeaderView(view: unknown, tintColor: string | undefined): ReactNode {
  if (typeof view === "function") {
    const renderView = view as (headerProps: {
      canGoBack: boolean
      tintColor?: string
    }) => ReactNode

    return renderView({ canGoBack: false, tintColor })
  }

  return view as ReactNode
}

function searchBarInputTypeToKeyboardType(
  inputType: NativeStackNavigationSearchBarOptions["inputType"]
) {
  const keyboardTypeByInputType = {
    email: "email-address",
    number: "numeric",
    phone: "phone-pad",
  } as const

  return inputType && inputType in keyboardTypeByInputType
    ? keyboardTypeByInputType[inputType as keyof typeof keyboardTypeByInputType]
    : "default"
}

export { LargeTitleHeader }
