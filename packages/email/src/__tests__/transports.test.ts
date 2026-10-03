import { describe, expect, test } from "bun:test"
import { EmailConfigurationError, EmailDeliveryError } from "@init/core/errors"
import { selectTransport, smtpTransport } from "#transports.ts"

const message = {
  from: "init <dev@example.com>",
  html: "<p>Hello</p>",
  subject: "Hello",
  text: "Hello",
  to: ["ada@example.com"],
}

describe("smtpTransport", () => {
  test("reports an unreachable server as a retryable delivery error", async () => {
    const transport = smtpTransport("smtp://127.0.0.1:1")

    const error = await transport
      .send(message, { idempotencyKey: "key" })
      .catch((error: unknown) => error)

    expect(error).toBeInstanceOf(EmailDeliveryError)
    expect(error).toMatchObject({ isRetryable: true, transport: "smtp" })
  })
})

describe("selectTransport", () => {
  test("throws EmailConfigurationError without a Resend key or an SMTP URL", () => {
    expect(() => selectTransport({})).toThrow(EmailConfigurationError)
  })
})
