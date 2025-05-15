import { pgTableCreator, text, timestamp } from "drizzle-orm/pg-core"

import { generatePrefixedId } from "@init/utils/id"

export type BrandId<B extends string> = string & { readonly __brand__: B }

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = pgTableCreator(name => name)

export const UNIQUE_ID_LENGTH = 24

export function constructId<B extends string>(_brand: B, prefix: string) {
  return {
    id: text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedId(prefix, UNIQUE_ID_LENGTH))
      .$type<BrandId<B>>(),
  }
}

export const timestamps = {
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}
