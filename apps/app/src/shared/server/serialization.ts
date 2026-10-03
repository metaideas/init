import { createSerializationAdapter } from "@tanstack/react-router"
import { AppFault } from "@v1/core/errors"

export const faultSerializer = createSerializationAdapter({
  // oxlint-disable-next-line typescript/unbound-method -- Static deserializer does not use `this`.
  fromSerializable: AppFault.fromSerializable,
  key: "fault",
  test: AppFault.is,
  toSerializable: (value) => value.toSerializable(),
})
