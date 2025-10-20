import { defineConfig } from "tsdown"

export default defineConfig({
  dts: {
    emitDtsOnly: true,
  },
  entry: ["src/client.ts"],
  outDir: "dist",
})
