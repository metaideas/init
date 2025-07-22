import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "~/shared/trpc"

export function useHello() {
  const trpc = useTRPC()
  return useQuery(trpc.hello.queryOptions())
}
