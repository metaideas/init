import { buildKeyGenerator } from "@this/utils/key"

type KVCategory = "stripe" | "auth" | "organization"

export const generateKVKey = buildKeyGenerator<KVCategory>()
