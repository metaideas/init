import * as PopoverPrimitive from "@rn-primitives/popover"
import * as React from "react"
import { Platform, StyleSheet } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

import { cn } from "@init/utils/ui"

import { TextClassContext } from "./text"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  PopoverPrimitive.ContentRef,
  PopoverPrimitive.ContentProps & { portalHost?: string }
>(
  (
    { className, align = "center", sideOffset = 4, portalHost, ...props },
    ref
  ) => {
    return (
      <PopoverPrimitive.Portal hostName={portalHost}>
        <PopoverPrimitive.Overlay
          style={Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined}
        >
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut}>
            <TextClassContext.Provider value="text-popover-foreground">
              <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={cn(
                  "web:data-[side=bottom]:slide-in-from-top-2 web:data-[side=left]:slide-in-from-right-2 web:data-[side=right]:slide-in-from-left-2 web:data-[side=top]:slide-in-from-bottom-2 web:zoom-in-95 web:fade-in-0 z-50 w-72 web:animate-in web:cursor-auto rounded-md border border-border bg-popover p-4 shadow-foreground/5 shadow-md web:outline-none",
                  className
                )}
                {...props}
              />
            </TextClassContext.Provider>
          </Animated.View>
        </PopoverPrimitive.Overlay>
      </PopoverPrimitive.Portal>
    )
  }
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverContent, PopoverTrigger }
