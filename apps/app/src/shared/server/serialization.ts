import type { SerializableFault } from "@init/error"
import { AppFault } from "@init/error"
import { createSerializationAdapter } from "@tanstack/react-router"

export const faultSerializer = createSerializationAdapter({
  fromSerializable: (value) => AppFault.fromSerializable(value as SerializableFault),
  key: "fault",
  test: (value) => AppFault.is(value),
  toSerializable: (value) => value.toSerializable(),
})
