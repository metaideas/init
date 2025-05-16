"use client"

import { createTRPCClient } from "@init/utils/trpc-client"

import { getQueryClient } from "~/shared/query-client"
import type { AppRouter } from "~/shared/trpc/router"
import { buildApiUrl } from "~/shared/utils"

const queryClient = getQueryClient()
const url = buildApiUrl("/trpc")

// In this implementation we're providing the app router to the Next.js server,
// but we could easily swipe it out with the router in the API project and use
// that as our backend.
export const { useTRPC, useTRPCClient, TRPCProvider } =
  createTRPCClient<AppRouter>(url, queryClient)
