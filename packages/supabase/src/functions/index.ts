import type {
  FunctionInvokeOptions,
  SupabaseClient,
} from "@supabase/supabase-js"
import { z } from "zod"

type FunctionName = "test-function"

export const FunctionsRequestSchemaMap = {
  "test-function": z.object({
    name: z.string().min(1),
  }),
} satisfies Record<FunctionName, z.ZodSchema>

const FunctionsResponseSchemaMap = {
  "test-function": z.object({
    message: z.string(),
  }),
} satisfies Record<FunctionName, z.ZodSchema>

export type FunctionsRequestBody<T extends FunctionName> = z.infer<
  (typeof FunctionsRequestSchemaMap)[T]
>
export type FunctionsResponseBody<T extends FunctionName> = z.infer<
  (typeof FunctionsResponseSchemaMap)[T]
>

export function buildInvokeFunction(supabase: SupabaseClient) {
  return function invokeFunction<T extends FunctionName>(
    name: T,
    body: FunctionsRequestBody<T>,
    options: Omit<FunctionInvokeOptions, "body"> = {}
  ): ReturnType<typeof supabase.functions.invoke<FunctionsResponseBody<T>>> {
    return supabase.functions.invoke(name, {
      ...options,
      body,
    })
  }
}

export function parseFunctionRequestBody<T extends FunctionName>(
  name: T,
  body: unknown
): FunctionsRequestBody<T> {
  return FunctionsRequestSchemaMap[name].parse(body)
}
