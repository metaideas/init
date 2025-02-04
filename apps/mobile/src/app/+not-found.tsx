import { Text } from "@this/ui/native/text"
import { Link, Stack } from "expo-router"
import { View } from "react-native"

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center">
        <Text>This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  )
}
