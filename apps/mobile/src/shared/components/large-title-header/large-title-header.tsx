import { Portal } from "@rn-primitives/portal"
import { cn } from "cn"
import { Stack, useNavigation, useRoute } from "expo-router"
import { SymbolView, type SymbolViewProps } from "expo-symbols"
import * as React from "react"
import { BackHandler, Platform, Pressable, Text, TextInput, View } from "react-native"
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutRight,
  withTiming,
  ZoomIn,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useCSSVariable } from "uniwind"
import type {
  LargeTitleHeaderProps,
  NativeStackNavigationSearchBarOptions,
} from "#shared/components/large-title-header/types.ts"

const SCREEN_OPTIONS = {
  headerShown: false,
}

export function LargeTitleHeader(props: LargeTitleHeaderProps) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const id = React.useId()
  const [foreground, mutedForeground] = useCSSVariable([
    "--color-foreground",
    "--color-muted-foreground",
  ])
  const foregroundColor = typeof foreground === "string" ? foreground : undefined
  const mutedForegroundColor = typeof mutedForeground === "string" ? mutedForeground : undefined

  const [searchValue, setSearchValue] = React.useState("")
  const [showSearchBar, setShowSearchBar] = React.useState(false)
  const focusSearchInput = React.useCallback((input: TextInput | null) => {
    input?.focus()
  }, [])
  const onChangeTextProp = props.searchBar?.onChangeText

  React.useImperativeHandle(
    props.searchBar?.ref,
    () => ({
      cancelSearch: () => {
        setShowSearchBar(false)
        setSearchValue("")
        onChangeTextProp?.("")
      },
      clearText: () => {
        setSearchValue("")
        onChangeTextProp?.("")
      },
      focus: () => {
        setShowSearchBar(true)
      },
      setText: (text) => {
        setSearchValue(text)
        onChangeTextProp?.(text)
      },
    }),
    [onChangeTextProp]
  )

  React.useEffect(() => {
    if (Platform.OS !== "android") return

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!showSearchBar) return false

      setShowSearchBar(false)
      setSearchValue("")
      onChangeTextProp?.("")
      return true
    })

    return () => {
      backHandler.remove()
    }
  }, [onChangeTextProp, showSearchBar])

  function onBlur() {
    if (searchValue.length === 0) {
      setShowSearchBar(false)
    }
    props.searchBar?.onBlur?.()
  }

  function onChangeText(text: string) {
    setSearchValue(text)
    onChangeTextProp?.(text)
  }

  function onSearchBackPress() {
    setShowSearchBar(false)
    setSearchValue("")
    onChangeTextProp?.("")
  }

  function onClearText() {
    setSearchValue("")
    onChangeTextProp?.("")
    props.searchBar?.onCancelButtonPress?.()
  }

  const isInlined = props.materialPreset === "inline"
  const canGoBack = navigation.canGoBack()

  if (props.shown === false) return null

  return (
    <>
      <Stack.Screen options={{ ...props.screen, ...SCREEN_OPTIONS }} />
      <View
        className={cn(
          "bg-background px-1 shadow-none",
          props.shadowVisible && "shadow-xl",
          isInlined ? "pb-4" : "pb-5"
        )}
        style={{
          backgroundColor: props.backgroundColor,
          paddingTop: insets.top + 14,
        }}
      >
        <View className="flex-row justify-between px-0.5">
          <View className="flex-1 flex-row items-center">
            {props.leftView ? (
              <View className="flex-row justify-center gap-4 pl-0.5">
                {props.leftView({ canGoBack, tintColor: foregroundColor })}
              </View>
            ) : (
              props.backVisible !== false
              && canGoBack && (
                <IconButton
                  accessibilityLabel="Go back"
                  color={foregroundColor}
                  icon={{ android: "arrow_back", ios: "arrow.left", web: "arrow_back" }}
                  onPress={() => {
                    navigation.goBack()
                  }}
                />
              )
            )}
            {isInlined ? (
              <View className={cn("flex-1", canGoBack ? "pl-4" : "pl-3")}>
                <Text
                  className={cn("text-2xl text-foreground", props.materialTitleClassName)}
                  numberOfLines={1}
                >
                  {props.title ?? route.name}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row justify-center gap-3 pr-2">
            {props.searchBar ? (
              <IconButton
                accessibilityLabel="Search"
                color={foregroundColor}
                icon={{ android: "search", ios: "magnifyingglass", web: "search" }}
                onPress={() => {
                  setShowSearchBar(true)
                  props.searchBar?.onSearchButtonPress?.()
                }}
              />
            ) : null}
            {props.rightView?.({ canGoBack, tintColor: foregroundColor })}
          </View>
        </View>
        {isInlined ? null : (
          <View className="px-3 pt-6">
            <Text
              className={cn("text-3xl text-foreground", props.materialTitleClassName)}
              numberOfLines={1}
            >
              {props.title ?? route.name}
            </Text>
          </View>
        )}
      </View>
      {props.searchBar && showSearchBar ? (
        <Portal name={`large-title:${id}`}>
          <Animated.View className="absolute inset-0 z-50" exiting={FadeOut}>
            <View
              className="relative z-50 overflow-hidden bg-background"
              style={{ paddingTop: insets.top + 6 }}
            >
              <Animated.View
                className="absolute right-4 bottom-2.5 left-4 h-14 rounded-full bg-muted/25 dark:bg-card"
                entering={customEntering}
                exiting={customExiting}
              />
              <View className="pb-2.5">
                <Animated.View
                  className="h-14 flex-row items-center pr-5 pl-3.5"
                  entering={FadeIn}
                  exiting={FadeOut}
                >
                  <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <IconButton
                      accessibilityLabel="Close search"
                      color={mutedForegroundColor}
                      icon={{ android: "arrow_back", ios: "arrow.left", web: "arrow_back" }}
                      onPress={onSearchBackPress}
                    />
                  </Animated.View>
                  <Animated.View className="flex-1" entering={FadeInRight} exiting={FadeOutRight}>
                    <TextInput
                      autoCapitalize={searchBarAutoCapitalizeToTextInput(
                        props.searchBar.autoCapitalize
                      )}
                      blurOnSubmit={props.searchBar.materialBlurOnSubmit}
                      className="flex-1 rounded-r-full p-2 text-[17px] text-foreground"
                      keyboardType={searchBarInputTypeToKeyboardType(props.searchBar.inputType)}
                      onBlur={onBlur}
                      onChangeText={onChangeText}
                      onFocus={props.searchBar.onFocus}
                      onSubmitEditing={props.searchBar.materialOnSubmitEditing}
                      placeholder={props.searchBar.placeholder ?? "Search..."}
                      placeholderTextColorClassName="accent-muted-foreground"
                      ref={focusSearchInput}
                      returnKeyType="search"
                      style={
                        props.searchBar.textColor ? { color: props.searchBar.textColor } : undefined
                      }
                      value={searchValue}
                    />
                  </Animated.View>
                  <View className="flex-row items-center gap-3 pr-0.5">
                    {searchValue ? (
                      <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <IconButton
                          accessibilityLabel="Clear search"
                          color={mutedForegroundColor}
                          icon={{ android: "close", ios: "multiply", web: "close" }}
                          onPress={onClearText}
                        />
                      </Animated.View>
                    ) : null}
                    {props.searchBar.materialRightView?.({
                      canGoBack,
                      tintColor: foregroundColor,
                    })}
                  </View>
                </Animated.View>
              </View>
              {isInlined ? <Animated.View className="h-px bg-border" entering={ZoomIn} /> : null}
            </View>
            <Animated.View className="flex-1 bg-background" entering={FadeInUp}>
              <View className="flex-1 bg-muted/25 dark:bg-card">{props.searchBar.content}</View>
            </Animated.View>
          </Animated.View>
        </Portal>
      ) : null}
    </>
  )
}

function IconButton({
  accessibilityLabel,
  color,
  icon,
  onPress,
}: {
  accessibilityLabel: string
  color: string | undefined
  icon: Exclude<SymbolViewProps["name"], string>
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="size-10 items-center justify-center rounded-full active:bg-muted/50"
      onPress={onPress}
    >
      <SymbolView name={icon} size={24} tintColor={color} />
    </Pressable>
  )
}

function searchBarInputTypeToKeyboardType(
  inputType: NativeStackNavigationSearchBarOptions["inputType"]
) {
  switch (inputType) {
    case "email":
      return "email-address"
    case "number":
      return "numeric"
    case "phone":
      return "phone-pad"
    default:
      return "default"
  }
}

function searchBarAutoCapitalizeToTextInput(
  autoCapitalize: NativeStackNavigationSearchBarOptions["autoCapitalize"]
): React.ComponentProps<typeof TextInput>["autoCapitalize"] {
  switch (autoCapitalize) {
    case "none":
    case "words":
    case "sentences":
    case "characters":
      return autoCapitalize
    default:
      return undefined
  }
}

function customEntering() {
  "worklet"
  return {
    animations: {
      transform: [{ scale: withTiming(3, { duration: 400 }) }],
    },
    initialValues: {
      transform: [{ scale: 1 }],
    },
  }
}

function customExiting() {
  "worklet"
  return {
    animations: {
      opacity: withTiming(0),
      transform: [{ scale: withTiming(1) }],
    },
    initialValues: {
      opacity: 1,
      transform: [{ scale: 3 }],
    },
  }
}
