import { Link, Stack } from "expo-router"
import { View } from "react-native"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@init/native-ui/accordion"
import { Text } from "@init/native-ui/text"

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center">
        <Accordion type="single" collapsible className="w-full max-w-sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <Text>Is it accessible?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <Text>What are universal components?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text>
                In the world of React Native, universal components are
                components that work on both web and native platforms.
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Link href="/" className="mt-4 py-4">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  )
}
