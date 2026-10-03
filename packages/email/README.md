<div align="center">
  <h1 align="center"><code>@init/email</code></h1>
</div>

Email templates built with [React Email](https://react.email/), delivered through [Resend](https://resend.com/) or any SMTP server.

```ts
import { createMailer } from "@init/email/mailer"
import { selectTransport } from "@init/email/transports"

const mailer = createMailer({
  from: ENV.EMAIL_FROM,
  logger: log,
  transport: selectTransport({ resendApiKey: ENV.RESEND_API_KEY, smtpUrl: ENV.SMTP_URL }),
})

await mailer.send("password-reset", { resetUrl }, { to: [user.email] })
```

Add a template under `src/templates/` and register it with its subject in `src/registry.ts`. Run `bun run dev` to preview templates. Locally, email goes to Mailpit from Docker Compose; open http://localhost:8005 to read it. Tests can pass `memoryTransport()` and read what was sent from its `sent` array.

`send` retries temporary failures with backoff and returns a failed delivery as a `SendEmailError` value instead of throwing.
