import { createTRPCReact } from "@trpc/react-query"
import type { TRPCClient } from "api/client"

export const trpc = createTRPCReact<TRPCClient>()
