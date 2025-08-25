import { Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"
import env from "~/shared/env"

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Edit app/index.tsx to edit this screen.
        <Text style={styles.text}>{env.EXPO_PUBLIC_API_URL}</Text>
      </Text>
    </View>
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
