import type { SerializableFault } from "@init/error"
import type { Serializable } from "@tanstack/react-router"
import { AppFault } from "@init/error"
import { createSerializationAdapter } from "@tanstack/react-router"

type SerializableFaultValue =
  | Serializable
  | readonly SerializableFaultValue[]
  | { readonly [key: string]: SerializableFaultValue }

export const faultSerializer = createSerializationAdapter({
  fromSerializable: (value: SerializableFaultValue) =>
    AppFault.fromSerializable(value as SerializableFault),
  key: "fault",
  test: (value) => AppFault.is(value),
  toSerializable: (value) => value.toSerializable() as SerializableFaultValue,
})
