import type { SearchBarCommands } from "react-native-screens"
import { Stack } from "expo-router"
import * as React from "react"
import { type NativeSyntheticEvent, type TextInputSubmitEditingEvent, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

type NativeStackNavigationOptions = Exclude<
  NonNullable<React.ComponentPropsWithoutRef<typeof Stack.Screen>["options"]>,
  // oxlint-disable-next-line no-explicit-any - Generic function to allow the header to be customized
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

type NativeStackNavigationSearchBarOptions = NonNullable<HeaderOptions["headerSearchBarOptions"]>

type LargeTitleSearchBarRef = Omit<SearchBarCommands, "blur" | "toggleCancelButton">

const styles = StyleSheet.create((theme) => ({
  header: {
    backgroundColor: theme.colors.background,
  },
  headerLeft: {
    flexDirection: "row",
    gap: theme.spacing[4],
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: theme.spacing[4],
    justifyContent: "center",
  },
  searchBar: {
    zIndex: 99_999,
  },
}))

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
  iosBlurEffect?: Exclude<HeaderOptions["headerBlurEffect"], undefined> | "none"
  materialPreset?: "stack" | "inline"
  backVisible?: boolean
  /**
   * IOS - iosBlurEffect must be set to 'none' for this to work
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
          headerBackButtonMenuEnabled: props.iosBackButtonMenuEnabled,
          headerBackTitle: props.iosBackButtonTitle,
          headerBackVisible: props.backVisible,
          headerBlurEffect:
            iosBlurEffect === "none" ? undefined : (iosBlurEffect ?? "systemMaterial"),
          headerLargeStyle: {
            backgroundColor: props.backgroundColor ?? theme.colors.background,
          },
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: props.shadowVisible,
          headerLeft: leftView
            ? (headerProps) => (
                <View style={styles.headerLeft}>
                  {typeof leftView === "function" ? leftView(headerProps) : leftView}
                </View>
              )
            : undefined,
          headerRight: rightView
            ? (headerProps) => (
                <View style={styles.headerRight}>
                  {typeof rightView === "function" ? rightView(headerProps) : rightView}
                </View>
              )
            : undefined,
          headerSearchBarOptions: searchBar
            ? {
                autoCapitalize: searchBar.autoCapitalize,
                cancelButtonText: searchBar.iosCancelButtonText,
                hideWhenScrolling: searchBar.iosHideWhenScrolling ?? false,
                inputType: searchBar.inputType,
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
                tintColor: searchBar.iosTintColor,
              }
            : undefined,
          headerShadowVisible: props.shadowVisible,
          headerShown: shown,
          headerStyle:
            iosBlurEffect === "none"
              ? {
                  backgroundColor: props.backgroundColor ?? theme.colors.background,
                }
              : undefined,
          headerTitle: title,
          headerTitleStyle: {
            color: theme.colors.foreground,
          },
          headerTransparent: iosBlurEffect !== "none",
          ...screen,
        }}
      />
      {searchBar?.content && (isFocused || searchValue.length > 0) && (
        <Animated.View
          entering={FadeIn.delay(100).duration(200)}
          exiting={FadeOut}
          style={[styles.searchBar, StyleSheet.absoluteFill]}
        >
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={StyleSheet.absoluteFill}>
            {searchBar?.content}
          </Animated.View>
        </Animated.View>
      )}
    </>
  )
}

export { LargeTitleHeader, type LargeTitleSearchBarRef }
