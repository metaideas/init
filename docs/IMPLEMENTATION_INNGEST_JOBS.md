# Inngest Jobs Implementation

This document provides a complete overview of the `@init/jobs` package implementation.

## Overview

Successfully migrated from `@init/queue` (Upstash QStash) to `@init/jobs` (Inngest) following all requirements from Linear issue INI-55.

## Implementation Details

### 1. Package Structure

Created new package at `packages/jobs/` with the following structure:

```
packages/jobs/
├── src/
│   ├── client.ts    # Inngest client with type-safe Events export
│   ├── schema.ts    # EventSchemas definition
│   ├── serve.ts     # Hono integration helper
│   └── index.ts     # Main exports
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
├── reset.d.ts       # Type definitions
└── README.md        # Package documentation
```

### 2. Key Files

#### client.ts
- Exports Inngest client instance configured with schemas
- Exports `Events` type inferred from schemas
- Provides type-safe event sending and function creation

#### schema.ts
- Defines EventSchemas using Zod
- Provides template for adding custom events
- Exported as default and named export

#### serve.ts
- Exports `serve()` helper function
- Integrates Inngest with Hono framework
- Simplifies function registration

#### index.ts
- Main entry point
- Re-exports all public APIs
- Clean import paths for consumers

### 3. Dependencies

**Added to `packages/jobs/package.json`:**
- `inngest` v4.1.5+
- `@init/observability` (workspace)
- `@init/utils` (workspace)

**Dev dependencies:**
- `hono` v4.10.7 (for type definitions)
- TypeScript

### 4. API Integration

#### Updated Files:
- `apps/api/package.json` - Changed `@init/queue` to `@init/jobs`
- `apps/api/src/routes/index.ts` - Added queues route
- `apps/api/src/routes/queues.ts` - New route for Inngest handler

#### Created Files:
- `apps/api/src/functions/example.ts` - Example function template

#### Route Configuration:
```typescript
// apps/api/src/routes/index.ts
.route("/queues", queuesRoutes)
```

The `/queues` endpoint:
- Handles Inngest function execution
- Accepts function registrations
- Provides webhook endpoint for Inngest

### 5. Dev Server Configuration

#### Package Scripts:
```json
{
  "dev": "bunx inngest-cli@latest dev -u http://localhost:3000/queues -p 8288"
}
```

Features:
- Runs on port 8288 (as specified in requirements)
- Connects to API at `http://localhost:3000/queues`
- Auto-discovers functions
- Provides dev UI at `http://localhost:8288`

### 6. Environment Variables

#### Updated turbo.json:
**Removed:**
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `QSTASH_TOKEN`
- `QSTASH_URL`

**Added:**
- `INNGEST_EVENT_KEY` (optional)
- `INNGEST_SIGNING_KEY` (optional)

Note: These are optional and only needed for production deployments.

### 7. Cleanup

#### Removed:
- `packages/queue/` directory (completely deleted)
- Upstash dependencies from workspace
- `@upstash/qstash-cli` from trustedDependencies

#### Updated:
- Root `package.json` - removed `@upstash/qstash-cli` from trustedDependencies
- `apps/api/package.json` - replaced `@init/queue` with `@init/jobs`

## Usage Examples

### Defining Events

```typescript
// packages/jobs/src/schema.ts
export const schemas = {
  "user/created": {
    data: z.object({
      userId: z.string(),
      email: z.string().email(),
      name: z.string(),
    }),
  },
  "order/completed": {
    data: z.object({
      orderId: z.string(),
      userId: z.string(),
      total: z.number(),
    }),
  },
}
```

### Creating Functions

```typescript
// apps/api/src/functions/user-created.ts
import { inngest } from "@init/jobs/client"

export const userCreatedFunction = inngest.createFunction(
  { id: "user-created" },
  { event: "user/created" },
  async ({ event, step }) => {
    // Step 1: Fetch user details
    const user = await step.run("fetch-user", async () => {
      return { 
        id: event.data.userId, 
        email: event.data.email 
      }
    })

    // Step 2: Send welcome email
    await step.run("send-welcome-email", async () => {
      // Email sending logic
      console.log(`Sending welcome email to ${user.email}`)
    })

    // Step 3: Track event
    await step.run("track-signup", async () => {
      // Analytics tracking
      console.log(`User ${user.id} signed up`)
    })

    return { success: true, userId: user.id }
  }
)
```

### Registering Functions

```typescript
// apps/api/src/routes/queues.ts
import { serve } from "@init/jobs"
import { userCreatedFunction } from "#functions/user-created.ts"
import { orderCompletedFunction } from "#functions/order-completed.ts"

export default serve([
  userCreatedFunction,
  orderCompletedFunction,
])
```

### Sending Events

```typescript
import { inngest } from "@init/jobs/client"

// Anywhere in your application
await inngest.send({
  name: "user/created",
  data: {
    userId: "usr_123",
    email: "user@example.com",
    name: "John Doe",
  },
})
```

## Development Workflow

### 1. Start API Server
```bash
bun run dev --filter api
```

### 2. Start Inngest Dev Server
```bash
bun run dev --filter @init/jobs
```

### 3. Access Dev UI
Open `http://localhost:8288` in your browser to:
- View registered functions
- Trigger test events
- Debug function execution
- View logs and traces

## Testing

### Local Testing
1. Start both API and Inngest dev servers
2. Navigate to Inngest dev UI
3. Select a function
4. Send test event with sample data
5. View execution results and logs

### Production Testing
- Events are queued automatically
- Retries are handled by Inngest
- Failures are logged and reported

## Benefits Over Previous Implementation

1. **Type Safety**: Full TypeScript support with inferred types
2. **Developer Experience**: Built-in dev UI and debugging tools
3. **Reliability**: Automatic retries and error handling
4. **Observability**: Built-in logging and tracing
5. **Flexibility**: Easy to add steps, delays, and complex workflows
6. **No External Services**: Works without Redis or additional infrastructure
7. **Better Documentation**: Comprehensive docs and examples

## Next Steps

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Define Your Events**
   - Add event schemas to `packages/jobs/src/schema.ts`

3. **Create Functions**
   - Add function files to `apps/api/src/functions/`
   - Register them in `apps/api/src/routes/queues.ts`

4. **Test Locally**
   - Run dev servers
   - Test via Inngest UI

5. **Deploy**
   - Set environment variables (if needed)
   - Deploy API with `/queues` endpoint
   - Configure Inngest in production

## Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [TypeScript SDK](https://www.inngest.com/docs/typescript)
- [Hono Integration](https://www.inngest.com/docs/learn/serving-inngest-functions#framework-hono)
- [Migration Guide](./MIGRATION_QUEUE_TO_JOBS.md)

## Support

For issues or questions:
1. Check the migration guide: `docs/MIGRATION_QUEUE_TO_JOBS.md`
2. Review Inngest documentation
3. Check example function: `apps/api/src/functions/example.ts`
4. Review package README: `packages/jobs/README.md`
