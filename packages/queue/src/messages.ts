import { safeParseJSON } from "@init/utils/json"
import type * as z from "@init/utils/schema"
import { Client, Receiver, type VerifyRequest } from "@upstash/qstash"

type EventsSchema = Record<string, z.ZodType>
type MessageType<Events extends EventsSchema> = keyof Events & string
type MessageBody<
  Events extends EventsSchema,
  T extends MessageType<Events>,
> = z.infer<Events[T]>

type MessageClientConfig = {
  token: string
  currentSigningKey: string
  nextSigningKey: string
}

type MessageClientOptions<Events extends EventsSchema> = {
  baseUrl: string
  events: Events
}

type VerifyResult<Events extends EventsSchema, T extends MessageType<Events>> =
  | { success: true; body: MessageBody<Events, T> }
  | { success: false; error: Response }

type SignatureResult =
  | { success: true; body: string }
  | { success: false; message: string; status: number }

function createFailureResult(message: string, status: number) {
  return {
    success: false as const,
    error: new Response(message, { status }),
  }
}

async function verifyRequestSignature(
  request: Request,
  receiver: Receiver,
  clockTolerance?: number
): Promise<SignatureResult> {
  const body = await request.clone().text()
  const signature = request.headers.get("upstash-signature")

  if (!signature) {
    return {
      success: false,
      message: "Missing upstash-signature header",
      status: 400,
    }
  }

  const isValid = await receiver.verify({ signature, body, clockTolerance })

  return isValid
    ? { success: true, body }
    : { success: false, message: "Invalid signature", status: 401 }
}

export function createMessageClient<Events extends EventsSchema>(
  config: MessageClientConfig,
  options: MessageClientOptions<Events>
) {
  const client = new Client({ token: config.token })
  const receiver = new Receiver({
    currentSigningKey: config.currentSigningKey,
    nextSigningKey: config.nextSigningKey,
  })

  function getPublishBody<T extends MessageType<Events>>(
    type: T,
    body: MessageBody<Events, T>
  ) {
    return {
      url: `${options.baseUrl}/${type}`,
      body,
    }
  }

  async function verifyMessageRequest<T extends MessageType<Events>>(
    request: Request,
    messageType: T,
    { clockTolerance }: Pick<VerifyRequest, "clockTolerance">
  ): Promise<VerifyResult<Events, T>> {
    const signatureResult = await verifyRequestSignature(
      request,
      receiver,
      clockTolerance
    )

    if (!signatureResult.success) {
      return createFailureResult(
        signatureResult.message,
        signatureResult.status
      )
    }

    const [parsedBody, parseError] = safeParseJSON(
      signatureResult.body,
      options.events[messageType]
    )

    if (parseError) {
      return createFailureResult("Invalid message structure", 400)
    }

    return { success: true, body: parsedBody }
  }

  return { client, getPublishBody, verifyMessageRequest }
}

export {
  anthropic,
  type Client as QstashClient,
  openai,
  resend,
} from "@upstash/qstash"
