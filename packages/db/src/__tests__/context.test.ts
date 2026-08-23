import { describe, expect, test } from "bun:test"
import type { Database } from "#client.ts"
import { type DatabaseTransaction, useDatabase, withDatabase, withTransaction } from "#context.ts"

function createDatabaseDouble(transaction: DatabaseTransaction) {
  let transactionCount = 0

  const client = {
    transaction: async <T>(operation: (currentTransaction: DatabaseTransaction) => Promise<T>) => {
      transactionCount += 1
      return operation(transaction)
    },
  } as unknown as Database

  return {
    client,
    transactionCount: () => transactionCount,
  }
}

describe("useDatabase", () => {
  test("returns the database bound to the current async context", async () => {
    const first = {} as Database
    const second = {} as Database

    await Promise.all([
      withDatabase(first, async () => {
        await Promise.resolve()
        expect(useDatabase()).toBe(first)
      }),
      withDatabase(second, async () => {
        await Promise.resolve()
        expect(useDatabase()).toBe(second)
      }),
    ])
  })

  test("restores the parent database after a nested context finishes", () => {
    const parent = {} as Database
    const child = {} as Database

    withDatabase(parent, () => {
      expect(useDatabase()).toBe(parent)

      withDatabase(child, () => {
        expect(useDatabase()).toBe(child)
      })

      expect(useDatabase()).toBe(parent)
    })
  })
})

describe("withTransaction", () => {
  test("binds a transaction to the current async context", async () => {
    const transaction = {} as DatabaseTransaction
    const root = createDatabaseDouble(transaction)

    await withDatabase(root.client, async () => {
      await withTransaction((currentTransaction) => {
        expect(currentTransaction).toBe(transaction)
        expect(useDatabase()).toBe(transaction)
        return Promise.resolve()
      })
    })

    expect(root.transactionCount()).toBe(1)
  })

  test("reuses the active transaction for nested operations", async () => {
    const transaction = {} as DatabaseTransaction
    const root = createDatabaseDouble(transaction)

    await withDatabase(root.client, async () => {
      await withTransaction(async () => {
        await withTransaction((currentTransaction) => {
          expect(currentTransaction).toBe(transaction)
          expect(useDatabase()).toBe(transaction)
          return Promise.resolve()
        })
      })
    })

    expect(root.transactionCount()).toBe(1)
  })
})
