import { pgTableCreator, text, timestamp } from "drizzle-orm/pg-core"

import { generatePrefixedId } from "@init/utils/id"
import * as z from "@init/utils/schema"
import type { ConstrainedString } from "@init/utils/type"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = pgTableCreator(name => name)

export const UNIQUE_ID_LENGTH = 24

export function constructId<B extends string, P extends string>(
  brand: B,
  prefix: ConstrainedString<P, 3>
) {
  const IdSchema = z.string().brand(brand)

  return {
    id: text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedId(prefix, UNIQUE_ID_LENGTH))
      .$type<z.infer<typeof IdSchema>>(),
  }
}

export const timestamps = {
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}

export * from "drizzle-orm/pg-core"
