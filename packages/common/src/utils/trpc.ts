import { uneval } from "devalue"
import superjson from "superjson"

export const transformer = {
  input: superjson,
  output: {
    serialize: (object: unknown) => uneval(object),
    // biome-ignore lint/security/noGlobalEval: "This `eval` only ever happens on the client with data coming from the server"
    deserialize: (object: unknown) => eval(`(${object})`),
  },
}
