import { describe, expect, test } from "bun:test"
import { InvalidBaseUrlError } from "@init/core/errors"
import { faultSerializer } from "#shared/server/serialization.ts"

describe("faultSerializer", () => {
  test("round-trips an application fault", () => {
    const error = new InvalidBaseUrlError({ value: "not-a-url" }).withMessage("Invalid base URL")

    const serialized = faultSerializer.toSerializable(error)
    const restored = faultSerializer.fromSerializable(serialized)

    expect(restored).toBeInstanceOf(InvalidBaseUrlError)
    if (!(restored instanceof InvalidBaseUrlError)) throw new Error("Expected InvalidBaseUrlError")

    expect(restored.message).toBe("Invalid base URL")
    expect(restored.value).toBe("not-a-url")
  })
})
