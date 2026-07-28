export const internalPaths = [
  "release-please-config.json",
  ".github/workflows/release.yml",
  ".github/workflows/opencode.yml",
  ".github/workflows/cli.yml",
  ".plans",
  "cli",
] as const

export function checkIsInternalPath(filePath: string): boolean {
  return internalPaths.some((path) => filePath === path || filePath.startsWith(`${path}/`))
}
