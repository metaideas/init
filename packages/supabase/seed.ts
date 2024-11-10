/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed"

async function main() {
  const seed = await createSeedClient()
  // Truncate all tables in the database
  await seed.$resetDatabase()

  // Seed the database with 10 users
  await seed.users(x => x(10))

  await seed.organizations(x => x(10))

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  process.exit()
}

main()
