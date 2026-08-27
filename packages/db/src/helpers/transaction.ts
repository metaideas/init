import { AsyncLocalStorage } from "node:async_hooks"
import { database, type Database } from "#client.ts"

export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0]

const storage = new AsyncLocalStorage<DatabaseTransaction>()

/**
 * Runs the operation inside a transaction. Nested calls reuse the active
 * transaction, so composed domain operations commit or roll back together.
 */
export async function withTransaction<T>(
  operation: (transaction: DatabaseTransaction) => Promise<T>
): Promise<T> {
  const current = storage.getStore()

  if (current) {
    return operation(current)
  }

  return database().transaction((transaction) =>
    storage.run(transaction, () => operation(transaction))
  )
}
