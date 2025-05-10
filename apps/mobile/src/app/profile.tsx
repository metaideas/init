import { SafeAreaView } from "react-native-safe-area-context"

import { Text } from "@init/native-ui/components/text"
import { TextField } from "@init/native-ui/components/text-field"
import { View } from "react-native"

export default function Screen() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center gap-4">
        <Text>Profile</Text>
        <View className="w-full">
          <TextField placeholder="Name" label="Name" />
        </View>
      </View>
    </SafeAreaView>
  )
}
