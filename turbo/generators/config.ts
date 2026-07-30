import type { PlopTypes } from "@turbo/gen"
import { registerCodeSnippetsGenerator } from "./commands/code-snippets"
import { registerConnectBackendGenerator } from "./commands/connect-backend"
import { registerNewFeatureGenerator } from "./commands/new-feature"
import { registerNewPackageGenerator } from "./commands/new-package"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  registerNewFeatureGenerator(plop)
  registerNewPackageGenerator(plop)
  registerConnectBackendGenerator(plop)
  registerCodeSnippetsGenerator(plop)
}
