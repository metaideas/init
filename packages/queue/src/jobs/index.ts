import { Client } from "@upstash/qstash"
import { QstashError, Receiver } from "@upstash/qstash"
import type { VerifySignatureConfig } from "@upstash/qstash/nextjs"

import env from "@this/env/queue.server"

import { type JobPayload, JobSchemaMap, type JobType } from "./schema"

export const jobClient = new Client({ token: env.QSTASH_TOKEN })

export const batchJobs = jobClient.batchJSON
export const publishJob = jobClient.publishJSON

export function createJobRequestBuilder<U extends string>(baseUrl: U) {
  return function buildJobRequest<T extends JobType>(
    type: T,
    body: JobPayload<T>
  ): { url: `${U}/${T}`; body: JobPayload<T> } {
    return { url: `${baseUrl}/${type}`, body }
  }
}

export async function verifyJobRequest<T extends JobType>(
  request: Request,
  jobType: T,
  config?: VerifySignatureConfig
) {
  const requestClone = request.clone()
  const body = await requestClone.text()

  const signature = request.headers.get("upstash-signature")

  if (!signature) {
    throw new QstashError("`Upstash-Signature` header is missing")
  }

  if (typeof signature !== "string") {
    throw new QstashError("`Upstash-Signature` header is not a string")
  }

  const receiver = new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  })

  const isValid = await receiver.verify({
    signature,
    body,
    clockTolerance: config?.clockTolerance,
  })

  if (!isValid) {
    throw new QstashError("Invalid signature")
  }

  let json: unknown

  try {
    json = JSON.parse(body)
  } catch {
    throw new QstashError("Invalid JSON payload")
  }

  const result = JobSchemaMap[jobType].safeParse(json)
  if (!result.success) {
    throw new QstashError("Invalid job payload")
  }

  return result.data
}

export { resend, openai, anthropic } from "@upstash/qstash"
