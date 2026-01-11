import { Fault } from "@init/error/fault"
import { createSerializationAdapter } from "@tanstack/react-router"

export const faultSerializer = createSerializationAdapter({
  // @ts-expect-error - unknown type
  fromSerializable: (value) => Fault.fromSerializable(value),
  key: "fault",
  test: (value) => Fault.isFault(value),
  toSerializable: (value) => Fault.toSerializable(value),
})
