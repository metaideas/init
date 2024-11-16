// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { render } from "@react-email/render"
import TestEmail from "@this/email/test-email"
import { parseFunctionRequestBody } from "@this/supabase/functions"

Deno.serve(async req => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const json = await req.json()
  const { name } = parseFunctionRequestBody("test-function", json)

  const data = {
    message: `Hello ${name}!!!`,
    content: await render(TestEmail(), { plainText: true, pretty: true }),
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  })
})
