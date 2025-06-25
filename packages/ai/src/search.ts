import { Search } from "@upstash/search"

export function createSearch() {
  return Search.fromEnv()
}
