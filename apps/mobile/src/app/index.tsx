import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRef, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { Button } from "#shared/components/ui/button.tsx"
import {
  LargeTitleHeader,
  type LargeTitleSearchBarRef,
} from "#shared/components/ui/large-title-header.tsx"
import { Text } from "#shared/components/ui/text.tsx"
import env from "#shared/env.ts"

export default function Screen() {
  const { theme } = useUnistyles()
  const [isLoading, setIsLoading] = useState(false)
  const searchBarRef = useRef<LargeTitleSearchBarRef>(null)

  return (
    <>
      <LargeTitleHeader
        backgroundColor={theme.colors.background}
        searchBar={{
          ref: searchBarRef,
        }}
        title="Home"
      />
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text color="primary" variant="heading">
            Edit app/index.tsx to edit this screen.
          </Text>
          <Text color="primary" variant="body">
            API at {env.EXPO_PUBLIC_API_URL}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={() => setIsLoading(!isLoading)}>
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
            <FontAwesome color={theme.colors.primary} name="heart" size={21} />
          </Button>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[8],
    backgroundColor: theme.colors.background,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[4],
  },
}))
