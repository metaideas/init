import esbuild from "esbuild"
import { nodeExternalsPlugin } from "esbuild-node-externals"

import { prompt, runScript } from "@tooling/helpers"

async function build() {
  const spinner = prompt.spinner()

  spinner.start("Building API...")

  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    outdir: "dist",
    plugins: [nodeExternalsPlugin({ allowWorkspaces: true })],
  })

  spinner.stop("API built successfully")
}

runScript(build)
