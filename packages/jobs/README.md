<div align="center">
  <h1 align="center"><code>@init/jobs</code></h1>
</div>

Background jobs and queue package built with [Inngest](https://www.inngest.com/docs).

## Features

- Type-safe job definitions with EventSchemas
- Powered by Inngest for reliable job execution
- Easy integration with Hono-based APIs

## Usage

### Define your events schema

```typescript
import { z } from "zod"

export const events = {
  "user/created": {
    data: z.object({
      userId: z.string(),
      email: z.string().email(),
    }),
  },
}
```

### Trigger jobs

```typescript
import { inngest } from "@init/jobs/client"

await inngest.send({
  name: "user/created",
  data: {
    userId: "123",
    email: "user@example.com",
  },
})
```

### Create job functions

```typescript
import { inngest } from "@init/jobs/client"

export const userCreatedJob = inngest.createFunction(
  { id: "user-created" },
  { event: "user/created" },
  async ({ event, step }) => {
    // Your job logic here
    await step.run("send-welcome-email", async () => {
      // Send email
    })
  }
)
```

## Development

Run the Inngest dev server:

```bash
bun run dev
```

This will start the Inngest dev server connected to your API endpoint at `http://localhost:3000/queues`.
