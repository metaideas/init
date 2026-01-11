import * as Bun from "bun"

await Bun.$`cd src/functions/components/better-auth && bun x @better-auth/cli generate --output schema.generated.ts -y`
