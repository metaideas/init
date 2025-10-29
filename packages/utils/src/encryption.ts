import { Buffer } from "node:buffer"
import crypto from "node:crypto"

/**
 * AES-256-GCM encryption algorithm with authenticated encryption.
 */
const ALGORITHM = "aes-256-gcm"

/**
 * Initialization vector length in bytes (128 bits).
 */
const IV_LENGTH = 16

/**
 * Authentication tag length in bytes (128 bits).
 */
const AUTH_TAG_LENGTH = 16

/**
 * Minimum payload length in bytes (IV + auth tag).
 */
const MIN_PAYLOAD_LENGTH = IV_LENGTH + AUTH_TAG_LENGTH

/**
 * Cached encryption key to avoid re-parsing the environment variable on every
 * operation.
 */
let cachedKey: Buffer | null = null

/**
 * Gets and validates the encryption key from environment variables. The key is
 * cached after the first successful retrieval to improve performance.
 *
 * @throws {Error} If INIT_ENCRYPTION_KEY is not set or invalid
 * @returns The 32-byte encryption key as a Buffer
 */
function getKey(): Buffer {
  if (cachedKey) {
    return cachedKey
  }

  const key = process.env.INIT_ENCRYPTION_KEY

  if (!key) {
    throw new Error("INIT_ENCRYPTION_KEY environment variable is not set")
  }

  const keyBuffer = Buffer.from(key, "hex")

  if (keyBuffer.length !== 32) {
    throw new Error(
      "INIT_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    )
  }

  cachedKey = keyBuffer
  return cachedKey
}

/**
 * Encrypts a plaintext string using AES-256-GCM authenticated encryption. Each
 * encryption uses a random initialization vector (IV), so encrypting the same
 * plaintext multiple times produces different encrypted output.
 *
 * The output format is: [IV (16 bytes)][Auth Tag (16 bytes)][Encrypted Data]
 * encoded as base64.
 *
 * @example
 * const encrypted = encrypt("secret message")
 * // Returns base64 string like "k8Jm3n2..."
 *
 * @example
 * const encrypted1 = encrypt("hello")
 * const encrypted2 = encrypt("hello")
 * // encrypted1 !== encrypted2 (different random IVs)
 *
 * @param text - The plaintext string to encrypt
 * @returns Base64 encoded string containing IV, auth tag, and encrypted data
 * @throws {Error} If encryption key is not configured
 */
export function encrypt(text: string): string {
  const key = getKey()

  // Generate a random initialization vector for this encryption
  const iv = crypto.randomBytes(IV_LENGTH)

  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  // Encrypt the plaintext directly to a buffer
  const encryptedData = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ])

  // Get the authentication tag (ensures integrity and authenticity)
  const authTag = cipher.getAuthTag()

  // Concatenate IV, auth tag, and encrypted data, then encode as base64
  const payload = Buffer.concat([iv, authTag, encryptedData]).toString(
    "base64"
  )

  return payload
}

/**
 * Decrypts an AES-256-GCM encrypted string that was encrypted using the
 * `encrypt` function. The function verifies the authentication tag to ensure
 * the data hasn't been tampered with.
 *
 * @example
 * const encrypted = encrypt("secret message")
 * const decrypted = decrypt(encrypted)
 * // decrypted === "secret message"
 *
 * @example
 * decrypt("invalid-data") // throws Error
 *
 * @param encryptedPayload - Base64 encoded string from the encrypt function
 * @returns The original plaintext string
 * @throws {Error} If payload is invalid, corrupted, or authentication fails
 */
export function decrypt(encryptedPayload: string): string {
  try {
    const key = getKey()

    // Decode the base64 payload to a buffer
    const dataBuffer = Buffer.from(encryptedPayload, "base64")

    // Validate minimum payload length (IV + auth tag + at least some data)
    if (dataBuffer.length < MIN_PAYLOAD_LENGTH) {
      throw new Error(
        `Invalid encrypted payload: expected at least ${MIN_PAYLOAD_LENGTH} bytes, got ${dataBuffer.length}`
      )
    }

    // Extract components from the payload
    // Format: [IV (16 bytes)][Auth Tag (16 bytes)][Encrypted Data]
    const iv = dataBuffer.subarray(0, IV_LENGTH)
    const authTag = dataBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encryptedData = dataBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    // Create decipher with the same algorithm and key
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    // Set the authentication tag for verification
    decipher.setAuthTag(authTag)

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]).toString("utf8")

    return decrypted
  } catch (error) {
    // Wrap crypto errors with more context
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`)
    }
    throw error
  }
}

/**
 * Hashes a string using SHA-256. This produces a deterministic 64-character
 * hexadecimal string. The same input always produces the same output.
 *
 * Note: This is a fast hash without salting or stretching. Do not use this for
 * password hashing - use `crypto.scrypt()` or similar instead.
 *
 * @example
 * hash("hello world")
 * // Returns "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
 *
 * @example
 * hash("hello") === hash("hello") // true (deterministic)
 * hash("hello") !== hash("world") // true (collision resistant)
 *
 * @param text - The string to hash
 * @returns SHA-256 hash as a 64-character hex string
 */
export function hash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex")
}

/**
 * Clears the cached encryption key. This is primarily useful for testing
 * purposes when you need to force re-validation of the environment variable.
 *
 * @internal
 */
export function clearKeyCache(): void {
  cachedKey = null
}
