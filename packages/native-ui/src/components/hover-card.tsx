import { cn } from "@init/utils/ui"
import * as HoverCardPrimitive from "@rn-primitives/hover-card"
import * as React from "react"
import { Platform, StyleSheet } from "react-native"
import { FadeIn, FadeOut } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"
import { NativeOnlyAnimatedView } from "./native-only-animated-view"
import { TextClassContext } from "./text"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: HoverCardPrimitive.ContentProps & React.RefAttributes<HoverCardPrimitive.ContentRef>) {
  return (
    <HoverCardPrimitive.Portal>
      <FullWindowOverlay>
        <HoverCardPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
          <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
            <TextClassContext.Provider value="text-popover-foreground">
              <HoverCardPrimitive.Content
                align={align}
                sideOffset={sideOffset}
                className={cn(
                  "z-50 w-64 rounded-md border border-border bg-popover p-4 shadow-md shadow-black/5 outline-hidden",
                  Platform.select({
                    web: cn(
                      "origin-(--radix-hover-card-content-transform-origin) animate-in cursor-default fade-in-0 zoom-in-95 [&>*]:cursor-auto",
                      props.side === "bottom" && "slide-in-from-top-2",
                      props.side === "top" && "slide-in-from-bottom-2"
                    ),
                  }),
                  className
                )}
                {...props}
              />
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </HoverCardPrimitive.Overlay>
      </FullWindowOverlay>
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
