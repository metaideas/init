import { describe, expect, test } from "bun:test"
import { createDatabase } from "#client.ts"
import { withTransaction } from "#helpers/transaction.ts"

// Runs against a Postgres server, such as the one from Docker Compose, when DATABASE_URL is set.
const url = Bun.env.DATABASE_URL ?? ""

describe("withTransaction", () => {
  test.skipIf(url === "")(
    "reuses the active transaction only for the database that opened it",
    async () => {
      const first = createDatabase({ url })
      const second = createDatabase({ url })

      try {
        await withTransaction(first, async (outer) => {
          await withTransaction(first, (inner) => {
            expect(inner).toBe(outer)
            return Promise.resolve()
          })

          await withTransaction(second, (inner) => {
            expect(inner).not.toBe(outer)
            return Promise.resolve()
          })
        })
      } finally {
        await first.$client.close()
        await second.$client.close()
      }
    }
  )
})
