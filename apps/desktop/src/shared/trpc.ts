import type { TRPCClient } from "api/client"

import { createTRPC } from "@this/utils/trpc-client"

import { buildApiUrl } from "~/shared/utils"

export const { trpcClient, useTRPC, useTRPCClient, TRPCProvider } =
  createTRPC<TRPCClient>(buildApiUrl("/trpc"))
