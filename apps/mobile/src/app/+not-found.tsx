import { Stack } from "expo-router"
import { Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.text}>This page doesn't exist</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xl,
  },
}))
