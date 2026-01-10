# Migration Guide: @init/queue to @init/jobs

This guide documents the migration from `@init/queue` (Upstash QStash) to `@init/jobs` (Inngest).

## What Changed

### Package Structure

**Before:**
```
packages/queue/
  ├── src/
  │   ├── messages.ts
  │   ├── workflows.ts
  │   ├── types.ts
  │   └── utils.ts
  ├── package.json
  └── README.md
```

**After:**
```
packages/jobs/
  ├── src/
  │   ├── client.ts      # Inngest client instance
  │   ├── schema.ts      # Event schemas definition
  │   ├── serve.ts       # Hono integration helper
  │   └── index.ts       # Package exports
  ├── package.json
  └── README.md
```

### Dependencies

**Removed:**
- `@upstash/qstash`
- `@upstash/workflow`
- `@upstash/qstash-cli`

**Added:**
- `inngest` (v4.1.5+)

### Environment Variables

**Removed:**
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `QSTASH_URL`

**Added:**
- `INNGEST_EVENT_KEY` (optional, for production)
- `INNGEST_SIGNING_KEY` (optional, for production)

## Migration Steps

### 1. Install Dependencies

Run at workspace root:
```bash
bun install
```

### 2. Update Imports

**Before:**
```typescript
import { MessageClient } from "@init/queue/messages"
import { WorkflowClient } from "@init/queue/workflows"
```

**After:**
```typescript
import { inngest, serve } from "@init/jobs"
```

### 3. Define Event Schemas

Create your event schemas in `packages/jobs/src/schema.ts`:

```typescript
import { z } from "@init/utils/schema"

export const schemas = {
  "user/created": {
    data: z.object({
      userId: z.string(),
      email: z.string().email(),
    }),
  },
  "order/completed": {
    data: z.object({
      orderId: z.string(),
      amount: z.number(),
    }),
  },
}
```

### 4. Create Inngest Functions

Create functions in `apps/api/src/functions/`:

```typescript
import { inngest } from "@init/jobs/client"

export const userCreatedFunction = inngest.createFunction(
  { id: "user-created" },
  { event: "user/created" },
  async ({ event, step }) => {
    const user = await step.run("fetch-user", async () => {
      return { id: event.data.userId, email: event.data.email }
    })

    await step.run("send-welcome-email", async () => {
      // Send email logic
    })

    return { success: true }
  }
)
```

### 5. Register Functions

Update `apps/api/src/routes/queues.ts`:

```typescript
import { serve } from "@init/jobs"
import { userCreatedFunction } from "#functions/user-created.ts"
import { orderCompletedFunction } from "#functions/order-completed.ts"

export default serve([
  userCreatedFunction,
  orderCompletedFunction,
])
```

### 6. Send Events

**Before:**
```typescript
const messageClient = new MessageClient({ ... })
await messageClient.events.user.created.publish({
  userId: "123",
  email: "user@example.com"
})
```

**After:**
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

## Development

### Running the Dev Server

Start the Inngest dev server:
```bash
bun run dev --filter @init/jobs
```

Or from the package directory:
```bash
cd packages/jobs
bun run dev
```

The dev server will:
- Run on port 8288 (or next available port starting from 8000+)
- Connect to your API at `http://localhost:3000/queues`
- Provide a UI at `http://localhost:8288`

### Testing Functions

1. Start your API server: `bun run dev --filter api`
2. Start the Inngest dev server: `bun run dev --filter @init/jobs`
3. Navigate to `http://localhost:8288`
4. Use the UI to trigger test events

## Key Differences

### 1. Event Names
- **Before:** Nested object structure (`stripe.checkout.created`)
- **After:** Slash-separated names (`stripe/checkout/created`)

### 2. Function Definition
- **Before:** Handler functions with context
- **After:** Inngest functions with steps

### 3. Retries & Steps
- **Before:** Workflow steps with QStash
- **After:** Built-in step management with Inngest

### 4. Local Development
- **Before:** `qstash dev --port 8288`
- **After:** `inngest-cli dev -u http://localhost:3000/queues -p 8288`

## Benefits of Inngest

1. **Better Developer Experience**: Built-in dev UI and debugging
2. **Type Safety**: Full TypeScript support with type inference
3. **Step Functions**: Automatic retries and state management
4. **Observability**: Built-in logging and monitoring
5. **Flexible Scheduling**: Cron, delays, and debouncing
6. **No External Dependencies**: Works without Redis or other services

## Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest TypeScript SDK](https://www.inngest.com/docs/typescript)
- [Hono Integration](https://www.inngest.com/docs/learn/serving-inngest-functions#framework-hono)
- [Event Schemas](https://www.inngest.com/docs/features/inngest-functions/event-types)
