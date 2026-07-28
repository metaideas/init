export const internalPaths = [
  "release-please-config.json",
  ".github/workflows/release.yml",
  ".github/workflows/opencode.yml",
  ".github/workflows/cli.yml",
  ".plans",
  "cli",
]

export function checkIsInternalPath(filePath: string) {
  return internalPaths.some((path) => filePath === path || filePath.startsWith(`${path}/`))
}
