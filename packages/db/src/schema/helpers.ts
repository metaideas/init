import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

import { generatePrefixedId } from "@this/utils/id"
import type { Brand } from "@this/utils/type"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = sqliteTableCreator(name => name)

export function constructId<T extends string>(prefix: string) {
  return {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedId(prefix, 24))
      .$type<Brand<string, T>>(),
  }
}

export const timestamps = {
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}
