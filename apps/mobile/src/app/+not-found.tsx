import { Stack } from "expo-router"
import { Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.text}>This page doesn&apos;t exist</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  text: {
    color: theme.colors.grey3,
    fontSize: theme.typography.fontSize.xl,
  },
}))
