// oxlint-disable no-console - We use console.log for logging in scripts

import { database } from "@init/db/client"
import { checkIsLocalDatabase } from "@init/db/helpers"
import * as schema from "@init/db/schema"
import { reset } from "drizzle-seed"
import { ENV } from "#env.generated.ts"

async function main() {
  console.log("\n🔄 Database Reset\n")

  if (!checkIsLocalDatabase(ENV.DATABASE_URL)) {
    throw new Error(
      "Cannot reset a non-local database. This script only works with local databases."
    )
  }

  const db = database()

  console.log("   Resetting database...\n")

  await reset(db, schema)

  console.log("✅ All data removed successfully. Database reset complete!\n")
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n✖  ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
