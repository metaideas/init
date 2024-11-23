import { getRandomValues, scryptSync, timingSafeEqual } from "node:crypto"
import { encodeHexLowerCase } from "@oslojs/encoding"

import { InternalError } from "@this/common/errors"

const ALGORITHM = "scrypt"
const MEMORY_COST = 2 ** 14
const BLOCK_SIZE = 8
const PARALLELISM = 5

const SALT_LENGTH = 16
const DERIVED_KEY_LENGTH = 64

function createSalt(): Buffer {
  const bytes = new Uint8Array(SALT_LENGTH)
  getRandomValues(bytes)

  return Buffer.from(bytes)
}

function constructHashString(hash: string, salt: string): string {
  const algorithm = `${ALGORITHM}`
  const params = `N=${MEMORY_COST},r=${BLOCK_SIZE},p=${PARALLELISM}`

  return `$${algorithm}$${params}$${salt}$${hash}`
}

function deconstructHashString(hashString: string): {
  algorithm: string
  params: {
    memoryCost: number
    blockSize: number
    parallelism: number
  }
  salt: string
  hash: string
} {
  const [, algorithm, params, salt, hash] = hashString.split("$")

  if (!algorithm || !params || !salt || !hash) {
    throw new InternalError("Invalid hash string")
  }

  const [memoryCostParam, blockSizeParam, parallelismParam] = params.split(",")

  const memoryCost = memoryCostParam?.split("=")[1]
  const blockSize = blockSizeParam?.split("=")[1]
  const parallelism = parallelismParam?.split("=")[1]

  if (!memoryCost || !blockSize || !parallelism) {
    throw new InternalError("Invalid hash string parameters")
  }

  return {
    algorithm,
    params: {
      memoryCost: Number.parseInt(memoryCost),
      blockSize: Number.parseInt(blockSize),
      parallelism: Number.parseInt(parallelism),
    },
    salt,
    hash,
  }
}

export function hashPassword(password: string): string {
  const salt = createSalt()
  const hash = scryptSync(password, salt, DERIVED_KEY_LENGTH, {
    N: MEMORY_COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
  })

  return constructHashString(encodeHexLowerCase(hash), encodeHexLowerCase(salt))
}

export function verifyPassword(password: string, hashString: string): boolean {
  const { algorithm, params, salt, hash } = deconstructHashString(hashString)

  // For now we only support one algorithm (scrypt), but we can extend this to
  // support other algorithms in the future and migrate users if needed.
  if (algorithm !== ALGORITHM) {
    throw new InternalError("Invalid hash algorithm")
  }

  const saltBuffer = Buffer.from(salt, "hex")
  const computedHash = scryptSync(password, saltBuffer, DERIVED_KEY_LENGTH, {
    N: params.memoryCost,
    r: params.blockSize,
    p: params.parallelism,
  })
  const hashBuffer = Buffer.from(hash, "hex")

  return timingSafeEqual(hashBuffer, computedHash)
}
