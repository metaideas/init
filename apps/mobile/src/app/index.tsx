import { Link } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@this/native-ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@this/native-ui/collapsible"
import { Text } from "@this/native-ui/text"

export default function Page() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-y-4">
      <Text className="font-bold text-4xl">Init Mobile</Text>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button>
            <Text>Click me</Text>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <View className="my-4 flex items-center justify-center">
            <Text>Hello world!</Text>
          </View>
        </CollapsibleContent>
      </Collapsible>

      <Link href="/+not-found" asChild>
        <Button variant="link">
          <Text>Go to not found</Text>
        </Button>
      </Link>
    </SafeAreaView>
  )
}
