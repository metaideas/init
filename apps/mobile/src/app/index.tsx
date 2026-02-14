import Feather from "@expo/vector-icons/Feather"
import { ActivityIndicator } from "@init/native-ui/components/activity-indicator"
import { Button } from "@init/native-ui/components/button"
import { Icon } from "@init/native-ui/components/icon"
import {
  LargeTitleHeader,
  type LargeTitleSearchBarRef,
} from "@init/native-ui/components/large-title-header"
import { Text } from "@init/native-ui/components/text"
import { useRef, useState } from "react"
import { View } from "react-native"
import { useCSSVariable } from "uniwind"
import env from "#shared/env.ts"

export default function Screen() {
  const backgroundValue = useCSSVariable("--color-background")
  const background = typeof backgroundValue === "string" ? backgroundValue : undefined
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchBarRef = useRef<LargeTitleSearchBarRef>(null)
  const isSearching = isSearchFocused || searchQuery.length > 0

  return (
    <>
      <LargeTitleHeader
        backgroundColor={background}
        searchBar={{
          onBlur: () => {
            setIsSearchFocused(false)
          },
          onCancelButtonPress: () => {
            setIsSearchFocused(false)
            setSearchQuery("")
          },
          onChangeText: (text) => {
            setSearchQuery(text)
          },
          onFocus: () => {
            setIsSearchFocused(true)
          },
          ref: searchBarRef,
        }}
        title="Home"
      />
      {isSearching ? null : (
        <View className="flex-1 items-center justify-center gap-8 bg-background">
          <View className="items-center justify-center gap-2">
            <Text className="text-base leading-6 font-semibold text-primary">
              Edit app/index.tsx to edit this screen.
            </Text>
            <Text className="text-base leading-6 text-primary">
              API at {env.EXPO_PUBLIC_API_URL}
            </Text>
          </View>
          <View className="items-center justify-center gap-4">
            <View>{isLoading ? <ActivityIndicator /> : null}</View>
            <Button
              onPress={() => {
                setIsLoading(!isLoading)
              }}
            >
              <Text>Default</Text>
            </Button>
            <Button variant="destructive">
              <Text>Destructive</Text>
            </Button>
            <Button variant="outline">
              <Text>Outline</Text>
            </Button>
            <Button variant="secondary">
              <Text>Secondary</Text>
            </Button>
            <Button variant="ghost">
              <Text>Ghost</Text>
            </Button>
            <Button variant="link">
              <Text>Link</Text>
            </Button>
            <Button size="icon">
              <Icon as={Feather} className="size-5 text-primary-foreground" name="heart" />
            </Button>
          </View>
        </View>
      )}
    </>
  )
}
