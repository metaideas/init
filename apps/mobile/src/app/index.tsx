import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRef, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { useCSSVariable } from "uniwind"
import { Button } from "#shared/components/ui/button.tsx"
import {
  LargeTitleHeader,
  type LargeTitleSearchBarRef,
} from "#shared/components/ui/large-title-header.tsx"
import { Text } from "#shared/components/ui/text.tsx"
import env from "#shared/env.ts"

export default function Screen() {
  const backgroundValue = useCSSVariable("--color-background")
  const primaryValue = useCSSVariable("--color-primary")
  const background = typeof backgroundValue === "string" ? backgroundValue : undefined
  const primary = typeof primaryValue === "string" ? primaryValue : undefined
  const [isLoading, setIsLoading] = useState(false)
  const searchBarRef = useRef<LargeTitleSearchBarRef>(null)

  return (
    <>
      <LargeTitleHeader
        backgroundColor={background}
        searchBar={{
          ref: searchBarRef,
        }}
        title="Home"
      />
      <View className="flex-1 items-center justify-center gap-8 bg-background">
        <View className="items-center justify-center gap-2">
          <Text color="primary" variant="heading">
            Edit app/index.tsx to edit this screen.
          </Text>
          <Text color="primary" variant="body">
            API at {env.EXPO_PUBLIC_API_URL}
          </Text>
        </View>
        <View className="items-center justify-center gap-4">
          <Button
            onPress={() => {
              setIsLoading(!isLoading)
            }}
          >
            {isLoading ? <ActivityIndicator /> : null}
            <Text>Test Loading</Text>
          </Button>
          <Button variant="secondary">
            <Text>Secondary</Text>
          </Button>
          <Button variant="tonal">
            <Text>Tonal</Text>
          </Button>
          <Button variant="plain">
            <Text>Plain</Text>
          </Button>
          <Button size="icon" variant="tonal">
            <FontAwesome color={primary} name="heart" size={21} />
          </Button>
        </View>
      </View>
    </>
  )
}
