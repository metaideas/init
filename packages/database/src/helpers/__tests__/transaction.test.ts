import { describe, expect, test } from "bun:test"
import { sql } from "drizzle-orm"
import { createDatabase } from "#client.ts"
import { withTransaction } from "#helpers/transaction.ts"

// Runs against a Postgres server, such as the one from Docker Compose, when DATABASE_URL is set.
const url = Bun.env.DATABASE_URL ?? ""

describe("withTransaction", () => {
  test.skipIf(url === "")(
    "reuses the active transaction of each database, including after nesting another database",
    async () => {
      const first = createDatabase({ url })
      const second = createDatabase({ url })

      try {
        await withTransaction(first, async (outer) => {
          await withTransaction(first, (inner) => {
            expect(inner).toBe(outer)
            return Promise.resolve()
          })

          await withTransaction(second, async (inner) => {
            expect(inner).not.toBe(outer)

            await withTransaction(first, (revisited) => {
              expect(revisited).toBe(outer)
              return Promise.resolve()
            })
          })
        })
      } finally {
        await first.$client.close()
        await second.$client.close()
      }
    }
  )

  test.skipIf(url === "")(
    "rolls back writes made after revisiting a database when its outer transaction fails",
    async () => {
      const first = createDatabase({ url })
      const second = createDatabase({ url })
      const table = sql.identifier(`writes_${crypto.randomUUID().replaceAll("-", "")}`)
      await first.execute(sql`CREATE TABLE ${table} (id integer)`)

      try {
        const result = await withTransaction(first, async () => {
          await withTransaction(second, () =>
            withTransaction(first, (transaction) =>
              transaction.execute(sql`INSERT INTO ${table} VALUES (1)`)
            )
          )

          throw new Error("Roll back the first database")
        }).catch((error: unknown) => error)

        expect(result).toBeInstanceOf(Error)
        expect(await first.execute(sql`SELECT id FROM ${table}`)).toHaveLength(0)
      } finally {
        await first.execute(sql`DROP TABLE ${table}`)
        await first.$client.close()
        await second.$client.close()
      }
    }
  )
})
