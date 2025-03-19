import { buildKeyGenerator } from "@init/utils/key"

type KVCategory = "stripe" | "auth" | "organization"

export const generateKVKey = buildKeyGenerator<KVCategory>()
