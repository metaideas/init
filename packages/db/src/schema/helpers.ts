import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

import { generatePrefixedId } from "@init/utils/id"

export type BrandId<B extends string> = string & { readonly __brand__: B }

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = sqliteTableCreator(name => name)

export function constructId<B extends string>(_brand: B, prefix: string) {
  return {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedId(prefix, 24))
      .$type<BrandId<B>>(),
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
