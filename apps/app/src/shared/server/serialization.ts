import { Fault } from "@init/error"
import { createSerializationAdapter } from "@tanstack/react-router"

export const errorSerializer = createSerializationAdapter({
  key: "fault",
  test: (value) => Fault.isFault(value),
  // @ts-expect-error - issues with the type definitions
  toSerializable: (value) => Fault.toSerializable(value),
  // @ts-expect-error - issues with the type definitions
  fromSerializable: (value) => Fault.fromSerializable(value),
})
