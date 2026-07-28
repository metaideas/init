import core from "adamantite/lint"
import node from "adamantite/lint/node"
import { defineConfig } from "oxlint"

const checkIsStandaloneCli = process.cwd() === import.meta.dirname

export default defineConfig({
  extends: [core, node],
  ...(checkIsStandaloneCli
    ? {
        options: {
          respectEslintDisableDirectives: true,
          typeAware: true,
          typeCheck: true,
        },
      }
    : // The root workspace check should not lint the standalone CLI, since its
      // dependencies are installed separately from the root workspace.
      { ignorePatterns: ["**"] }),
})
