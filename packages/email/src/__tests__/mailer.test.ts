import { describe, expect, test } from "bun:test"
import { SendEmailError } from "@init/core/errors"
import { createMailer } from "#mailer.ts"
import { memoryTransport } from "#transports.ts"

const props = { appName: "init", resetUrl: "https://example.com/reset?token=abc" }

describe("createMailer", () => {
  test("renders the template subject, HTML, and text and sends them through the transport", async () => {
    const transport = memoryTransport()
    const mailer = createMailer({ from: "init <dev@example.com>", transport })

    const { id } = await mailer.send("password-reset", props, { to: ["ada@example.com"] })

    expect(id).toBe("memory-1")
    expect(transport.sent).toHaveLength(1)

    const [message] = transport.sent
    expect(message?.from).toBe("init <dev@example.com>")
    expect(message?.to).toEqual(["ada@example.com"])
    expect(message?.subject).toBe("Reset your init password")
    expect(message?.html).toContain(props.resetUrl)
    expect(message?.text).toContain(props.resetUrl)
  })

  test("uses the sender from the send options over the default", async () => {
    const transport = memoryTransport()
    const mailer = createMailer({ from: "init <dev@example.com>", transport })

    await mailer.send("password-reset", props, {
      from: "support <support@example.com>",
      to: ["ada@example.com"],
    })

    expect(transport.sent[0]?.from).toBe("support <support@example.com>")
  })

  test("wraps transport failures in SendEmailError with the cause", async () => {
    const cause = new Error("connection refused")
    const mailer = createMailer({
      from: "init <dev@example.com>",
      transport: { send: () => Promise.reject(cause) },
    })

    const error = await mailer
      .send("password-reset", props, { to: ["ada@example.com"] })
      .catch((error: unknown) => error)

    expect(error).toBeInstanceOf(SendEmailError)
    expect(error).toMatchObject({ cause, template: "password-reset", to: ["ada@example.com"] })
  })
})
