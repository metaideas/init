import { describe, expect, test } from "bun:test"
import { SQL } from "bun"
import { createTestDatabase } from "#helpers/testing.ts"
import { users } from "#schema.ts"

// Runs against a Postgres server, such as the one from Docker Compose, when DATABASE_URL is set.
const url = Bun.env.DATABASE_URL ?? ""

describe("createTestDatabase", () => {
  test.skipIf(url === "")("creates a migrated database and drops it on dispose", async () => {
    const name = await useTestDatabase()
    const server = new SQL(url)

    try {
      const [row] = await server<[{ count: number }]>`
        SELECT count(*)::int AS count FROM pg_database WHERE datname = ${name}
      `

      expect(row.count).toBe(0)
    } finally {
      await server.close()
    }
  })

  async function useTestDatabase() {
    await using testDatabase = await createTestDatabase({ url })

    expect(await testDatabase.database.select().from(users)).toEqual([])

    return testDatabase.name
  }
})
