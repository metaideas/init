import type { PlopTypes } from "@turbo/gen"
import { registerConnectBackendGenerator } from "./recipes/backend-clients"
import { registerNewFeatureGenerator } from "./recipes/features/new-feature"
import { registerNewPackageGenerator } from "./recipes/workspaces/new-package"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  registerNewFeatureGenerator(plop)
  registerNewPackageGenerator(plop)
  registerConnectBackendGenerator(plop)
}
