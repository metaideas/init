export function checkIsInternalPath(filePath: string, internalPaths: readonly string[] = []) {
  return internalPaths.some((path) => filePath === path || filePath.startsWith(`${path}/`))
}
