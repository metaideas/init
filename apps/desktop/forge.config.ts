import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerDeb } from "@electron-forge/maker-deb"
import { MakerRpm } from "@electron-forge/maker-rpm"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { FusesPlugin } from "@electron-forge/plugin-fuses"
import { VitePlugin } from "@electron-forge/plugin-vite"
import { FuseV1Options, FuseVersion } from "@electron/fuses"

const config: ForgeConfig = {
  makers: [new MakerSquirrel({}), new MakerZIP({}, ["darwin"]), new MakerRpm({}), new MakerDeb({})],
  packagerConfig: {
    asar: true,
    icon: "./icons/icon",
  },
  plugins: [
    new VitePlugin({
      build: [
        {
          config: "vite.main.config.ts",
          entry: "src/shell/main.ts",
          target: "main",
        },
        {
          config: "vite.preload.config.ts",
          entry: "src/shell/preload.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          config: "vite.renderer.config.ts",
          name: "main_window",
        },
      ],
    }),
    // Disable runtime features that a packaged application does not need.
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.RunAsNode]: false,
    }),
  ],
  rebuildConfig: {},
}

export default config
