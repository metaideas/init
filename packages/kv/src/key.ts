import { buildKeyGenerator } from "@init/utils/cache"

type KVCategory = "stripe" | "auth" | "organization"

export const generateKVKey = buildKeyGenerator<KVCategory>()
