import { describe, expect, test, vi } from "vitest"
import { Fault, type FaultTag } from "../fault"

describe("Fault", () => {
  describe("constructor", () => {
    test("should create a Fault from an Error", () => {
      const error = new Error("Original error")
      const fault = new Fault(error)

      expect(fault).toBeInstanceOf(Error)
      expect(fault).toBeInstanceOf(Fault)
      expect(fault.message).toBe("Original error")
      expect(fault.cause).toBe(error)
    })

    test("should create a Fault from a string", () => {
      const fault = new Fault("Error message")

      expect(fault).toBeInstanceOf(Error)
      expect(fault).toBeInstanceOf(Fault)
      expect(fault.message).toBe("Error message")
      expect(fault.cause).toBeUndefined()
    })

    test("should capture location information", () => {
      const fault = new Fault("Test error")

      expect(fault.location).toBeDefined()
      expect(typeof fault.location).toBe("string")
      expect(fault.location).toContain("at ")
    })
  })

  describe("static from", () => {
    test("should create a Fault instance", () => {
      const fault = Fault.from("Test error")

      expect(fault).toBeInstanceOf(Fault)
      expect(fault.message).toBe("Test error")
    })
  })

  describe("tag getter", () => {
    test("should get tag from Fault instance", () => {
      const fault = Fault.from("Test error").withTag("NOT_FOUND")
      expect(fault.tag).toBe("NOT_FOUND")
    })
  })

  describe("message getter", () => {
    test("should get message from Fault instance", () => {
      const fault = Fault.from("Test error").withDescription(
        "Internal message",
        "Public message"
      )

      expect(fault.message).toBe("Public message")
    })

    test("should fall back to original error message if no custom message", () => {
      const fault = Fault.from("Test error")
      expect(fault.message).toBe("Test error")
    })
  })

  describe("details getter", () => {
    test("should get details from Fault instance", () => {
      const fault = Fault.from("Test error").withDescription("Internal message")
      expect(fault.details).toBe("Internal message")
    })
  })

  describe("statusCode getter", () => {
    test("should return 401 for AUTHENTICATION_ERROR", () => {
      const fault = Fault.from("Test error").withTag("AUTHENTICATION_ERROR")

      expect(fault.statusCode).toBe(401)
    })

    test("should return 404 for NOT_FOUND", () => {
      const fault = Fault.from("Test error").withTag("NOT_FOUND")

      expect(fault.statusCode).toBe(404)
    })

    test("should return 429 for RATE_LIMIT_EXCEEDED", () => {
      const fault = Fault.from("Test error").withTag("RATE_LIMIT_EXCEEDED")

      expect(fault.statusCode).toBe(429)
    })

    test("should return 500 for DATABASE_ERROR", () => {
      const fault = Fault.from("Test error").withTag("DATABASE_ERROR")

      expect(fault.statusCode).toBe(500)
    })

    test("should return 500 for INTERNAL_ERROR", () => {
      const fault = Fault.from("Test error").withTag("INTERNAL_ERROR")

      expect(fault.statusCode).toBe(500)
    })

    test("should return 500 for unknown tags", () => {
      const fault = Fault.from("Test error")

      expect(fault.statusCode).toBe(500)
    })
  })

  describe("withTag", () => {
    test("should add tag to Fault", () => {
      const fault = Fault.from("Test error").withTag("DATABASE_ERROR")

      expect(fault.tag).toBe("DATABASE_ERROR")
    })

    test("should return this for chaining", () => {
      const fault = Fault.from("Test error")
      const result = fault.withTag("DATABASE_ERROR")

      expect(result).toBe(fault)
    })
  })

  describe("withDescription", () => {
    test("should add details and message to Fault", () => {
      const fault = Fault.from("Test error").withDescription(
        "Internal message",
        "Public message"
      )

      expect(fault.details).toBe("Internal message")
      expect(fault.message).toBe("Public message")
    })

    test("should return this for chaining", () => {
      const fault = Fault.from("Test error")
      const result = fault.withDescription("Internal", "Public")

      expect(result).toBe(fault)
    })
  })

  describe("withDetails", () => {
    test("should add details to Fault", () => {
      const fault = Fault.from("Test error").withDetails("Details message")
      expect(fault.details).toBe("Details message")
    })

    test("should return this for chaining", () => {
      const fault = Fault.from("Test error")
      const result = fault.withDetails("Details")
      expect(result).toBe(fault)
    })
  })

  describe("withMetadata", () => {
    test("should add a single metadata entry to Fault", () => {
      const fault = Fault.from("Test error").withMetadata("key", "value")

      expect(fault.metadata).toEqual({ key: "value" })
    })

    test("should return this for chaining", () => {
      const fault = Fault.from("Test error")
      const result = fault.withMetadata("key", "value")

      expect(result).toBe(fault)
    })
  })

  describe("withContext", () => {
    test("should add multiple metadata entries to Fault", () => {
      const fault = Fault.from("Test error").withContext({
        key1: "value1",
        key2: "value2",
      })

      expect(fault.metadata).toEqual({ key1: "value1", key2: "value2" })
    })

    test("should merge with existing metadata", () => {
      const fault = Fault.from("Test error")
        .withMetadata("key1", "value1")
        .withContext({ key2: "value2", key3: "value3" })

      expect(fault.metadata).toEqual({
        key1: "value1",
        key2: "value2",
        key3: "value3",
      })
    })
  })

  describe("toJSON", () => {
    test("should serialize Fault to JSON", () => {
      const fault = Fault.from("Test error")
        .withTag("DATABASE_ERROR")
        .withDescription("Internal message", "Public message")
        .withMetadata("key", "value")

      const json = fault.toJSON()

      expect(json.name).toBe("Error")
      expect(json.message).toBe("Public message")
      expect(json.tag).toBe("DATABASE_ERROR")
      expect(json.details).toBe("Internal message")
      expect(json.statusCode).toBe(500)
      expect(json.metadata).toEqual({ key: "value" })
      expect(json.stack).toBeDefined()
    })

    test("should include serialized cause if it's a Fault", () => {
      const innerFault = Fault.from("Inner error").withTag(
        "AUTHENTICATION_ERROR"
      )
      const outerFault = Fault.from(innerFault).withTag("DATABASE_ERROR")
      const json = outerFault.toJSON()

      expect(json.cause).toBeDefined()
      if (json.cause && typeof json.cause === "object") {
        const causeObj = json.cause as { tag: FaultTag }
        expect(causeObj.tag).toBe("AUTHENTICATION_ERROR")
      }
    })

    test("should include basic cause info if it's a regular Error", () => {
      const error = new Error("Original error")
      error.stack = "Stack trace"

      const fault = Fault.from(error)
      const json = fault.toJSON()

      expect(json.cause).toBeDefined()
      if (json.cause && typeof json.cause === "object") {
        const causeObj = json.cause as {
          name: string
          message: string
          stack: string
        }
        expect(causeObj.name).toBe("Error")
        expect(causeObj.message).toBe("Original error")
        expect(causeObj.stack).toBe("Stack trace")
      }
    })
  })

  describe("getCauseChain", () => {
    test("should return an array of errors in the cause chain", () => {
      const innerError = new Error("Inner error")
      const middleError = new Error("Middle error", { cause: innerError })
      const outerFault = Fault.from(middleError)

      const chain = outerFault.getCauseChain()

      expect(chain.length).toBe(3)
      expect(chain[0]).toBe(outerFault)
      expect(chain[1]).toBe(middleError)
      expect(chain[2]).toBe(innerError)
    })
  })

  describe("practical usage", () => {
    test("should handle API errors properly", () => {
      const originalError = new Error("Database connection failed")

      const fault = Fault.from(originalError)
        .withTag("DATABASE_ERROR")
        .withDescription(
          "Failed to query user profile: connection refused",
          "Unable to load your profile at this time"
        )
        .withContext({ userId: "123", operation: "getUserProfile" })

      // Logging would typically capture the detailed error
      const logSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Error occurred:", fault.toJSON())

      expect(logSpy).toHaveBeenCalled()

      // API response would use the safe public message
      const apiResponse = {
        success: false,
        error: fault.message,
        status: fault.statusCode,
      }

      expect(apiResponse).toEqual({
        success: false,
        error: "Unable to load your profile at this time",
        status: 500,
      })

      logSpy.mockRestore()
    })
  })
})
