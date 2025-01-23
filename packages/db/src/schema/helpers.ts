import type { Brand } from "@this/common/types"
import { generatePrefixedId } from "@this/common/utils/id"
import { pgTableCreator, timestamp, varchar } from "drizzle-orm/pg-core"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = pgTableCreator(name => name)

export function publicId<T extends string>(prefix: string) {
  return {
    publicId: varchar("public_id", { length: 256 })
      .notNull()
      .unique()
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
