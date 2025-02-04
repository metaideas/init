import { Button } from "@this/ui/native/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@this/ui/native/collapsible"
import { Text } from "@this/ui/native/text"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Page() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-y-4">
      <Text className="font-bold text-4xl">Init Mobile</Text>
      <Button>
        <Text>Click me</Text>
      </Button>

      <Collapsible>
        <CollapsibleTrigger>
          <Text>Toggle</Text>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Text>Content</Text>
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
