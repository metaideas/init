import { getRandomValues, timingSafeEqual } from "node:crypto"
import { scryptAsync } from "@noble/hashes/scrypt"
import { decodeHex, encodeHexLowerCase } from "@oslojs/encoding"
import { InternalError } from "@this/common/errors"

type PasswordConfig = {
  algorithm: string
  params: {
    memoryCost: number
    blockSize: number
    parallelism: number
  }
}

const config: PasswordConfig = {
  algorithm: "scrypt",
  params: {
    memoryCost: 2 ** 14,
    blockSize: 16,
    parallelism: 1,
  },
}

const DERIVED_KEY_LENGTH = 64
const SALT_LENGTH = 16

function generateSalt(): Buffer {
  const bytes = new Uint8Array(SALT_LENGTH)
  getRandomValues(bytes)

  return Buffer.from(bytes)
}

async function generateKey(
  password: string,
  salt: string,
  params: PasswordConfig["params"]
): Promise<Uint8Array> {
  return await scryptAsync(password, salt, {
    dkLen: DERIVED_KEY_LENGTH,
    N: params.memoryCost,
    r: params.blockSize,
    p: params.parallelism,
    maxmem: 128 * params.memoryCost * params.blockSize * 2,
  })
}

function constructHashString(hash: string, salt: string): string {
  const params = `N=${config.params.memoryCost},r=${config.params.blockSize},p=${config.params.parallelism}`

  return `$${config.algorithm}$${params}$${salt}$${hash}`
}

function deconstructHashString(hashString: string): PasswordConfig & {
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

export async function hashPassword(password: string): Promise<string> {
  const salt = encodeHexLowerCase(generateSalt())
  const hash = await generateKey(password, salt, config.params)

  return constructHashString(encodeHexLowerCase(hash), salt)
}

export async function verifyPassword(
  password: string,
  hashString: string
): Promise<boolean> {
  const { algorithm, params, salt, hash } = deconstructHashString(hashString)

  // For now we only support one algorithm (scrypt), but we can extend this to
  // support other algorithms in the future and migrate users if needed.
  if (algorithm !== config.algorithm) {
    throw new InternalError("Invalid hash algorithm")
  }

  const targetKey = await generateKey(password, salt, params)

  return timingSafeEqual(decodeHex(hash), targetKey)
}
