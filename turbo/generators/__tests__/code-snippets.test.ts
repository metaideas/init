import type { PlopTypes } from "@turbo/gen"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdir, rm } from "node:fs/promises"
import { join } from "node:path"
import type * as z from "../../../packages/utils/src/schema/index"
import { registerCodeSnippetsGenerator } from "../commands/code-snippets"

type JsonCodec = <T extends z.core.$ZodType>(schema: T) => z.ZodCodec<z.ZodString, T>

const repositoryRoot = join(import.meta.dir, "../../..")
// Generated files must live inside `packages/utils` so its `#` imports resolve.
const outputDirectory = join(repositoryRoot, "packages/utils/.cache", crypto.randomUUID())

let jsonCodec: JsonCodec
let schema: typeof z

beforeAll(async () => {
  const action = getCodecAction()
  const template = await Bun.file(join(import.meta.dir, "..", action.templateFile)).text()

  expect(action.path).toBe("packages/utils/src/codec.ts")
  expect(template).not.toContain("{{")

  await mkdir(outputDirectory, { recursive: true })
  await Bun.write(join(outputDirectory, "codec.ts"), template)
  ;({ jsonCodec } = (await import(join(outputDirectory, "codec.ts"))) as { jsonCodec: JsonCodec })
  schema = await import("../../../packages/utils/src/schema/index")
})

afterAll(async () => {
  await rm(outputDirectory, { force: true, recursive: true })
})

describe("jsonCodec", () => {
  test("decodes valid JSON", () => {
    const codec = jsonCodec(schema.object({ count: schema.number() }))

    expect(codec.decode('{"count":1}')).toEqual({ count: 1 })
  })

  test("reports malformed JSON as an invalid_format issue", () => {
    const result = jsonCodec(schema.object({ count: schema.number() })).safeDecode("{")

    expect(result.success).toBe(false)
    expect(result.error?.issues).toMatchObject([{ code: "invalid_format", format: "json" }])
  })

  test("rejects decoded data that does not match the schema", () => {
    const result = jsonCodec(schema.object({ count: schema.number() })).safeDecode('{"count":"1"}')

    expect(result.success).toBe(false)
    expect(result.error?.issues).toMatchObject([{ code: "invalid_type", path: ["count"] }])
  })

  test("encodes values as JSON", () => {
    const codec = jsonCodec(schema.object({ count: schema.number() }))

    expect(codec.encode({ count: 1 })).toBe('{"count":1}')
  })
})

function getCodecAction() {
  let actions: PlopTypes.DynamicActionsFunction | undefined
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The generator only calls `setGenerator`.
  const plop = {
    setGenerator: (_name: string, config: { actions: PlopTypes.DynamicActionsFunction }) => {
      actions = config.actions
    },
  } as unknown as PlopTypes.NodePlopAPI

  registerCodeSnippetsGenerator(plop)

  const action = actions?.({ utilities: ["codec"] }).find(
    (candidate): candidate is PlopTypes.AddActionConfig =>
      typeof candidate === "object" && "templateFile" in candidate
  )

  if (!action?.templateFile) {
    throw new Error("The code-snippets generator did not add the codec template")
  }

  return { path: action.path, templateFile: action.templateFile }
}
