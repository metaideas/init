import { describe, expect, test } from "bun:test"
import { SQL } from "bun"
import { createTestDatabase } from "#helpers/testing.ts"
import { users } from "#schema.ts"

// Runs against a Postgres server, such as the one from Docker Compose, when DATABASE_URL is set.
const url = Bun.env.DATABASE_URL ?? ""

describe("createTestDatabase", () => {
  test.skipIf(url === "")("creates a migrated database and drops it on dispose", async () => {
    const name = await useTestDatabase(url)

    expect(await countDatabases(name)).toBe(0)
  })

  test.skipIf(url === "")("ignores a database query parameter in the server URL", async () => {
    const source = new URL(url)
    source.searchParams.set("database", source.pathname.slice(1))

    const name = await useTestDatabase(source.toString())

    expect(await countDatabases(name)).toBe(0)
  })
})

async function useTestDatabase(serverUrl: string) {
  await using testDatabase = await createTestDatabase({ url: serverUrl })
  const [row] = await testDatabase.database.$client<[{ name: string }]>`
    SELECT current_database() AS name
  `

  expect(row.name).toBe(testDatabase.name)
  expect(await testDatabase.database.select().from(users)).toEqual([])

  return testDatabase.name
}

async function countDatabases(name: string) {
  const server = new SQL(url)

  try {
    const [row] = await server<[{ count: number }]>`
      SELECT count(*)::int AS count FROM pg_database WHERE datname = ${name}
    `

    return row.count
  } finally {
    await server.close()
  }
}
