import { Stack } from "expo-router"
import * as React from "react"
import type {
  NativeSyntheticEvent,
  TextInputSubmitEditingEvent,
} from "react-native"
import { View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import type { SearchBarCommands } from "react-native-screens"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

type NativeStackNavigationOptions = Exclude<
  NonNullable<React.ComponentPropsWithoutRef<typeof Stack.Screen>["options"]>,
  // biome-ignore lint/suspicious/noExplicitAny: using any for generic purposes
  (props: any) => any
>

type ScreenOptions = Pick<
  NativeStackNavigationOptions,
  | "animation"
  | "animationDuration"
  | "contentStyle"
  | "navigationBarColor"
  | "animationTypeForReplace"
  | "autoHideHomeIndicator"
  | "gestureEnabled"
  | "freezeOnBlur"
  | "fullScreenGestureEnabled"
  | "gestureDirection"
  | "navigationBarHidden"
  | "orientation"
  | "presentation"
  | "statusBarTranslucent"
  | "statusBarStyle"
  | "statusBarHidden"
  | "statusBarAnimation"
  | "title"
  | "animationMatchesGesture"
  | "fullScreenGestureShadowEnabled"
  | "gestureResponseDistance"
  | "navigationBarTranslucent"
  | "keyboardHandlingEnabled"
  | "sheetAllowedDetents"
  | "sheetCornerRadius"
  | "sheetElevation"
  | "sheetExpandsWhenScrolledToEdge"
  | "sheetGrabberVisible"
  | "sheetInitialDetentIndex"
  | "sheetLargestUndimmedDetentIndex"
  | "unstable_sheetFooter"
>

type HeaderOptions = Omit<NativeStackNavigationOptions, keyof ScreenOptions>

type NativeStackNavigationSearchBarOptions = NonNullable<
  HeaderOptions["headerSearchBarOptions"]
>

type LargeTitleSearchBarRef = Omit<
  SearchBarCommands,
  "blur" | "toggleCancelButton"
>

function LargeTitleHeader({
  shown,
  title,
  leftView,
  rightView,
  screen,
  searchBar,
  iosBlurEffect,
  ...props
}: {
  iosBackButtonMenuEnabled?: boolean
  iosBackButtonTitle?: string
  iosBackButtonTitleVisible?: boolean
  /**
   * Default is 'systemMaterial'
   */
  iosBlurEffect?: HeaderOptions["headerBlurEffect"] | "none"
  materialPreset?: "stack" | "inline"
  materialTitleClassName?: string
  backVisible?: boolean
  /**
   * iOS - iosBlurEffect must be set to 'none' for this to work
   * @default iOS: true | Material: false
   */
  shadowVisible?: boolean
  leftView?: HeaderOptions["headerLeft"]
  rightView?: HeaderOptions["headerRight"]
  shown?: boolean
  title?: string
  backgroundColor?: string
  screen?: ScreenOptions
  searchBar?: {
    iosCancelButtonText?: string
    iosHideWhenScrolling?: boolean
    iosTintColor?: string
    materialRightView?: HeaderOptions["headerRight"]
    materialBlurOnSubmit?: boolean
    materialOnSubmitEditing?:
      | ((e: NativeSyntheticEvent<TextInputSubmitEditingEvent>) => void)
      | undefined
    autoCapitalize?: NativeStackNavigationSearchBarOptions["autoCapitalize"]
    inputType?: NativeStackNavigationSearchBarOptions["inputType"]
    onBlur?: () => void
    onCancelButtonPress?: () => void
    onChangeText?: (text: string) => void
    onFocus?: () => void
    onSearchButtonPress?: () => void
    placeholder?: string
    ref?: React.RefObject<LargeTitleSearchBarRef | null>
    textColor?: string
    content?: React.ReactNode
  }
}) {
  const [searchValue, setSearchValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const { theme } = useUnistyles()

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: true,
          headerBackButtonMenuEnabled: props.iosBackButtonMenuEnabled,
          headerBackTitle: props.iosBackButtonTitle,
          headerBackVisible: props.backVisible,
          headerLargeTitleShadowVisible: props.shadowVisible,
          headerBlurEffect:
            iosBlurEffect === "none"
              ? undefined
              : (iosBlurEffect ?? "systemMaterial"),
          headerShadowVisible: props.shadowVisible,
          headerLeft: leftView
            ? (headerProps) => (
                <View className="flex-row justify-center gap-4">
                  {leftView(headerProps)}
                </View>
              )
            : undefined,
          headerRight: rightView
            ? (headerProps) => (
                <View className="flex-row justify-center gap-4">
                  {rightView(headerProps)}
                </View>
              )
            : undefined,
          headerShown: shown,
          headerTitle: title,
          headerTransparent: iosBlurEffect !== "none",
          headerLargeStyle: {
            backgroundColor: props.backgroundColor ?? theme.colors.background,
          },
          headerStyle:
            iosBlurEffect === "none"
              ? {
                  backgroundColor:
                    props.backgroundColor ?? theme.colors.background,
                }
              : undefined,
          headerSearchBarOptions: searchBar
            ? {
                autoCapitalize: searchBar.autoCapitalize,
                cancelButtonText: searchBar.iosCancelButtonText,
                hideWhenScrolling: searchBar.iosHideWhenScrolling ?? false,
                inputType: searchBar.inputType,
                tintColor: searchBar.iosTintColor,
                onBlur: () => {
                  setIsFocused(false)
                  searchBar?.onBlur?.()
                },
                onCancelButtonPress: searchBar.onCancelButtonPress,
                onChangeText: (event) => {
                  const text = event.nativeEvent.text
                  setSearchValue(text)
                  if (searchBar.onChangeText) {
                    searchBar.onChangeText(event.nativeEvent.text)
                  }
                },
                onFocus: () => {
                  setIsFocused(true)
                  searchBar.onFocus?.()
                },
                onSearchButtonPress: searchBar.onSearchButtonPress,
                placeholder: searchBar.placeholder ?? "Search...",
                ref: searchBar?.ref as NativeStackNavigationSearchBarOptions["ref"],
                textColor: searchBar.textColor,
              }
            : undefined,
          ...screen,
        }}
      />
      {searchBar?.content && (isFocused || searchValue.length > 0) && (
        <Animated.View
          className="z-[99999]"
          entering={FadeIn.delay(100).duration(200)}
          exiting={FadeOut}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={StyleSheet.absoluteFill}
          >
            {searchBar?.content}
          </Animated.View>
        </Animated.View>
      )}
    </>
  )
}

export { LargeTitleHeader }
