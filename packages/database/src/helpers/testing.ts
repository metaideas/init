import { SQL } from "bun"
import { migrate } from "drizzle-orm/bun-sql/migrator"
import { createDatabase } from "#client.ts"

const MIGRATIONS_FOLDER = new URL("../../migrations", import.meta.url).pathname

/**
 * Creates a migrated database that only one test uses, on the server that `url` points at, and
 * drops it on dispose. Declare it with `await using` so the database is dropped even when the test
 * fails.
 */
export async function createTestDatabase({ url }: { url: string }) {
  const name = `test_${crypto.randomUUID().replaceAll("-", "")}`
  const server = new SQL(url)
  await server.unsafe(`CREATE DATABASE "${name}"`)

  const testUrl = new URL(url)
  testUrl.pathname = `/${name}`

  const database = createDatabase({ url: testUrl.toString() })
  await migrate(database, { migrationsFolder: MIGRATIONS_FOLDER })

  return {
    database,
    name,
    async [Symbol.asyncDispose]() {
      await database.$client.close()
      await server.unsafe(`DROP DATABASE "${name}" WITH (FORCE)`)
      await server.close()
    },
  }
}
