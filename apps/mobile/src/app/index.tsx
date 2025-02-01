import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

export default function Page() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-y-4">
      <Text className="font-bold text-4xl">Init Mobile</Text>
      <Button>
        <Text>Click me</Text>
      </Button>

      <Link href="/+not-found" asChild>
        <Button variant="link">
          <Text>Go to not found</Text>
        </Button>
      </Link>
    </SafeAreaView>
  )
}
