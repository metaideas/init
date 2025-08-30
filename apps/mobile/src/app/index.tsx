import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { Button } from "~/shared/components/ui/button"
import { LargeTitleHeader } from "~/shared/components/ui/large-title-header"
import { Text } from "~/shared/components/ui/text"
import { Toggle } from "~/shared/components/ui/toggle"
import env from "~/shared/env"

export default function Screen() {
  const { theme } = useUnistyles()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <LargeTitleHeader
        backgroundColor={theme.colors.background}
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
            <Text>Primary</Text>
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
          <Toggle
            onValueChange={() => setIsLoading(!isLoading)}
            value={isLoading}
          />
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
