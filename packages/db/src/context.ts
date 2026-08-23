import { AsyncLocalStorage } from "node:async_hooks"
import { database, type Database } from "#client.ts"

export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0]
export type DatabaseClient = Database | DatabaseTransaction

type DatabaseContext =
  | { client: Database; isTransaction: false }
  | { client: DatabaseTransaction; isTransaction: true }

const storage = new AsyncLocalStorage<DatabaseContext>()

export function useDatabase(): DatabaseClient {
  return storage.getStore()?.client ?? database()
}

export function withDatabase<T>(client: Database, operation: () => T): T {
  return storage.run({ client, isTransaction: false }, operation)
}

export async function withTransaction<T>(
  operation: (transaction: DatabaseTransaction) => Promise<T>
): Promise<T> {
  const current = storage.getStore()

  if (current?.isTransaction) {
    return operation(current.client)
  }

  const client = current?.client ?? database()

  return client.transaction((transaction) =>
    storage.run({ client: transaction, isTransaction: true }, () => operation(transaction))
  )
}
