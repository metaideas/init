import { QueryClient } from "@tanstack/react-query"
import type { TRPCClient } from "api/client"

import { createTRPCClient } from "@init/utils/trpc-client"

import { auth } from "~/shared/auth"
import { buildApiUrl } from "~/shared/utils"

const queryClient = new QueryClient()

export const { useTRPC, useTRPCClient, TRPCProvider } =
  createTRPCClient<TRPCClient>(buildApiUrl("/trpc"), {
    queryClient,
    headers() {
      const headers = new Headers()
      const cookies = auth.getCookie()
      if (cookies) {
        headers.set("Cookie", cookies)
      }
      return headers
    },
  })
