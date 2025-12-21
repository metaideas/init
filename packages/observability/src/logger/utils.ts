import type { Sink } from "@logtape/logtape"
import { DEFAULT_REDACT_FIELDS, redactByField } from "@logtape/redaction"

const PASSWORD_PATTERN = /pass(?:code|phrase|word)/i
const API_KEY_PATTERN = /api[-_]?key/i

export function redactSink(sink: Sink) {
  return redactByField(sink, {
    fieldPatterns: ["secret", PASSWORD_PATTERN, API_KEY_PATTERN, ...DEFAULT_REDACT_FIELDS],
    action: () => "[REDACTED]",
  })
}
