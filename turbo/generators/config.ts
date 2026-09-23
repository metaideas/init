import type { PlopTypes } from "@turbo/gen"
import { registerCodeSnippetsGenerator } from "./commands/code-snippets"
import { registerFilesClientGenerator } from "./commands/files-client"
import { registerNewFeatureGenerator } from "./commands/new-feature"
import { registerNewPackageGenerator } from "./commands/new-package"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  registerNewFeatureGenerator(plop)
  registerNewPackageGenerator(plop)
  registerCodeSnippetsGenerator(plop)
  registerFilesClientGenerator(plop)
}
