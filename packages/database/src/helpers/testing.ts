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
  const testUrl = new URL(url)
  testUrl.pathname = `/${name}`
  // Bun's SQL client lets a `database` query parameter override the path.
  testUrl.searchParams.delete("database")

  const server = new SQL(url)
  const database = createDatabase({ url: testUrl.toString() })

  async function dispose() {
    try {
      await database.$client.close()
      await server.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
    } finally {
      await server.close()
    }
  }

  try {
    await server.unsafe(`CREATE DATABASE "${name}"`)
    await migrate(database, { migrationsFolder: MIGRATIONS_FOLDER })
  } catch (error) {
    await dispose()
    throw error
  }

  return { database, name, [Symbol.asyncDispose]: dispose }
}
