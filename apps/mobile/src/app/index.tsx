import { Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"
import env from "~/shared/env"

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit app/index.tsx to edit this screen.</Text>
      <Text style={styles.text}>API at {env.EXPO_PUBLIC_API_URL}</Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xl,
  },
}))
