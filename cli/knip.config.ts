import type { KnipConfig } from "knip"
import analyze from "adamantite/analyze"

const config: KnipConfig = {
  ...analyze,
  entry: ["src/index.ts", "bunup.config.ts"],
  ignore: [],
  ignoreFiles: [],
  project: "src/**/*.ts",
}

export default config
