import { Stack } from "expo-router"
import { Text, View } from "react-native"

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl text-muted-foreground">This page doesn&apos;t exist</Text>
      </View>
    </>
  )
}
