import { AsyncLocalStorage } from "node:async_hooks"
import type { Database } from "#client.ts"

export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0]

const storage = new AsyncLocalStorage<{ database: Database; transaction: DatabaseTransaction }>()

/**
 * Runs the operation inside a transaction. Nested calls on the same database reuse the active
 * transaction, so composed domain operations commit or roll back together. A call on another
 * database opens its own transaction.
 */
export async function withTransaction<T>(
  database: Database,
  operation: (transaction: DatabaseTransaction) => Promise<T>
): Promise<T> {
  const current = storage.getStore()

  if (current?.database === database) {
    return operation(current.transaction)
  }

  return database.transaction((transaction) =>
    storage.run({ database, transaction }, () => operation(transaction))
  )
}
