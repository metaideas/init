import type { Brand } from "@this/common/types"
import { generateNoLookalikeId } from "@this/common/utils/id"
import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = sqliteTableCreator(name => name)

export function publicId<T extends string>(prefix: string) {
  return {
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => `${prefix}_${generateNoLookalikeId(24)}`)
      .$type<Brand<string, T>>(),
  }
}

export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
}
