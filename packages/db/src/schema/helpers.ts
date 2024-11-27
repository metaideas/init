import { generateNoLookalikeId } from "@this/common/utils/id"
import { integer, sqliteTableCreator } from "drizzle-orm/sqlite-core"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = sqliteTableCreator(name => name)

export function createPublicId(prefix: string) {
  return () => `${prefix}_${generateNoLookalikeId(24)}`
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
