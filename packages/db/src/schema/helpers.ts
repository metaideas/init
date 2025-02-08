import { pgTableCreator, timestamp, varchar } from "drizzle-orm/pg-core"

import { generatePrefixedId } from "@this/utils/id"
import type { Brand } from "@this/utils/type"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = pgTableCreator(name => name)

export function id<T extends string>(prefix: string) {
  return {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedId(prefix, 24))
      .$type<Brand<string, T>>(),
  }
}

export const timestamps = {
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}
