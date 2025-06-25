import { Axiom } from "@axiomhq/js"
import { singleton } from "@init/utils/singleton"

export default function axiom(token: string) {
  return singleton("axiom-client", () => new Axiom({ token }))
}
