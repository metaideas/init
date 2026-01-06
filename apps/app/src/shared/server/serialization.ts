import { Fault } from "@init/error"
import { createSerializationAdapter } from "@tanstack/react-router"

export const errorSerializer = createSerializationAdapter({
  // @ts-expect-error - unknown type
  fromSerializable: (value) => Fault.fromSerializable(value),
  key: "fault",
  test: (value) => Fault.isFault(value),
  toSerializable: (value) => Fault.toSerializable(value),
})
