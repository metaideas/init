/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */

import { copycat } from "@snaplet/copycat"
import { createSeedClient } from "@snaplet/seed"
import { logger } from "@this/observability/logger"
import { runScript } from "@tooling/utils"

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")

  logger.info("Starting seed...")

  logger.info("Creating seed client...")
  const seed = await createSeedClient({ dryRun })

  if (!dryRun) {
    logger.info("Truncating all tables in the database...")
    // Truncate all tables in the database
    await seed.$resetDatabase()
  }

  logger.info("Seeding users...")
  // Seed the database with 10 users
  await seed.users(x =>
    x(10, {
      email: ctx => copycat.email(ctx.seed),
    })
  )

  logger.info("Seeding organizations...")
  await seed.organizations(x => x(1))

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes
  logger.info("Seed completed")
}

runScript(main)
