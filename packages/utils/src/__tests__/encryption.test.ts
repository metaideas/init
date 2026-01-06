import { beforeAll, describe, expect, it } from "bun:test"
import { decrypt, encrypt, hash } from "../encryption"

// Regex patterns for validation
const BASE64_PATTERN = /^[A-Za-z0-9+/=]+$/
const HEX_PATTERN = /^[a-f0-9]{64}$/

// Set up a valid 32-byte (64-character hex) encryption key for tests
beforeAll(() => {
  process.env.INIT_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
})

describe("encrypt", () => {
  it("should return a base64 encoded string", () => {
    const plaintext = "hello world"
    const encrypted = encrypt(plaintext)

    // Base64 strings only contain these characters
    expect(encrypted).toMatch(BASE64_PATTERN)
  })

  it("should produce different output each time due to random IV", () => {
    const plaintext = "hello world"
    const encrypted1 = encrypt(plaintext)
    const encrypted2 = encrypt(plaintext)

    expect(encrypted1).not.toBe(encrypted2)
  })

  it("should encrypt empty string", () => {
    const encrypted = encrypt("")
    expect(encrypted).toBeTruthy()
    expect(typeof encrypted).toBe("string")
  })

  it("should encrypt unicode characters", () => {
    const plaintext = "Hello 世界 🌍"
    const encrypted = encrypt(plaintext)
    expect(encrypted).toBeTruthy()
  })
})

describe("decrypt", () => {
  it("should decrypt an encrypted string back to original", () => {
    const plaintext = "hello world"
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should handle empty string", () => {
    const plaintext = ""
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should handle unicode characters", () => {
    const plaintext = "Hello 世界 🌍"
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should handle special characters", () => {
    const plaintext = 'Test with "quotes" and \\backslashes\\ and\nnewlines'
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should throw error for invalid base64", () => {
    expect(() => decrypt("not-valid-base64!!!")).toThrow()
  })

  it("should throw error for payload that is too short", () => {
    // Create a valid base64 string that decodes to less than 32 bytes
    const shortPayload = Buffer.from("short").toString("base64")
    expect(() => decrypt(shortPayload)).toThrow()
  })

  it("should throw error for tampered data", () => {
    const plaintext = "hello world"
    const encrypted = encrypt(plaintext)

    // Tamper with the encrypted data by changing a character
    const tampered = `${encrypted.slice(0, -5)}XXXXX`

    expect(() => decrypt(tampered)).toThrow()
  })
})

describe("round-trip encryption", () => {
  it("should handle simple strings", () => {
    const inputs = ["hello", "world", "test123", "The quick brown fox jumps over the lazy dog"]

    for (const input of inputs) {
      const encrypted = encrypt(input)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(input)
    }
  })

  it("should handle long strings", () => {
    const plaintext = "a".repeat(10_000)
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should handle strings with newlines and tabs", () => {
    const plaintext = "line1\nline2\tindented\rcarriage return"
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should handle JSON strings", () => {
    const obj = {
      name: "test",
      nested: { array: [1, 2, 3] },
      value: 123,
    }
    const plaintext = JSON.stringify(obj)
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
    expect(JSON.parse(decrypted)).toEqual(obj)
  })

  it("should handle emoji and special unicode", () => {
    const plaintext = "🎉🎊🎈 Party time! 你好世界 مرحبا بالعالم"
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
  })
})

describe("hash", () => {
  it("should return a hex string", () => {
    const input = "hello world"
    const hashed = hash(input)

    // SHA-256 produces 64 hex characters
    expect(hashed).toMatch(HEX_PATTERN)
  })

  it("should be deterministic", () => {
    const input = "hello world"
    const hash1 = hash(input)
    const hash2 = hash(input)

    expect(hash1).toBe(hash2)
  })

  it("should produce different hashes for different inputs", () => {
    const hash1 = hash("hello")
    const hash2 = hash("world")

    expect(hash1).not.toBe(hash2)
  })

  it("should handle empty string", () => {
    const hashed = hash("")
    expect(hashed).toMatch(HEX_PATTERN)
  })

  it("should handle unicode", () => {
    const hashed = hash("Hello 世界 🌍")
    expect(hashed).toMatch(HEX_PATTERN)
  })

  it("should produce known hash for known input", () => {
    // SHA-256 of "hello world" is known
    const expected = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    expect(hash("hello world")).toBe(expected)
  })
})

describe("error handling", () => {
  it("should throw error when INIT_ENCRYPTION_KEY is not set", () => {
    const originalKey = process.env.INIT_ENCRYPTION_KEY
    process.env.INIT_ENCRYPTION_KEY = undefined

    expect(() => encrypt("test")).toThrow("INIT_ENCRYPTION_KEY")

    // Restore key
    process.env.INIT_ENCRYPTION_KEY = originalKey
  })

  it("should throw error when INIT_ENCRYPTION_KEY is invalid length", () => {
    const originalKey = process.env.INIT_ENCRYPTION_KEY
    process.env.INIT_ENCRYPTION_KEY = "tooshort"

    expect(() => encrypt("test")).toThrow("64-character hex string")

    // Restore key
    process.env.INIT_ENCRYPTION_KEY = originalKey
  })
})
