import { Text } from "@init/native-ui/_components/text"
import { Stack } from "expo-router"
import { View } from "react-native"

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center">
        <Text>This page doesn't exist</Text>
      </View>
    </>
  )
}
