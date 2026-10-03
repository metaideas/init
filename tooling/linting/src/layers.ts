import path from "node:path"

export type Boundaries = {
  routes?: string
  tiers?: readonly string[]
}

export type Layer =
  | { kind: "composition" }
  | { kind: "feature"; name: string }
  | { kind: "route" }
  | { kind: "shared" }

export type Location = {
  layer: Layer
  tier?: string
}

export type SourceRoot = {
  app: string
  path: string
}

export type Violation =
  | "featureImportsComposition"
  | "featureImportsFeature"
  | "routeImportsRoute"
  | "sharedImportsUp"
  | "tierImportsTier"

const SOURCE_ROOT = /^(?<root>.*\/apps\/(?<app>[^/]+)\/src)\//u
const MODULE_EXTENSIONS = new Set([
  "",
  ".astro",
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
])

export function findSourceRoot(filename: string): SourceRoot | undefined {
  const groups = SOURCE_ROOT.exec(filename.replaceAll("\\", "/"))?.groups

  if (groups?.root === undefined || groups.app === undefined) {
    return undefined
  }

  return { app: groups.app, path: groups.root }
}

export function resolveImport(root: SourceRoot, importer: string, specifier: string) {
  if (specifier.startsWith("#")) {
    return path.posix.join(root.path, specifier.slice(1))
  }

  return specifier.startsWith(".")
    ? path.posix.resolve(path.posix.dirname(importer.replaceAll("\\", "/")), specifier)
    : undefined
}

export function isModule(file: string) {
  return MODULE_EXTENSIONS.has(path.posix.extname(file))
}

export function locate(
  root: SourceRoot,
  boundaries: Boundaries,
  file: string
): Location | undefined {
  const relative = path.posix.relative(root.path, file)

  if (relative.startsWith("..")) {
    return undefined
  }

  const [top, name] = relative.split("/")
  const tier = top !== undefined && boundaries.tiers?.includes(top) ? top : undefined

  if (top === "shared") {
    return { layer: { kind: "shared" } }
  }

  if (top === "features" && name !== undefined) {
    return { layer: { kind: "feature", name } }
  }

  if (boundaries.routes !== undefined && relative.startsWith(`${boundaries.routes}/`)) {
    return { layer: { kind: "route" }, tier }
  }

  return { layer: { kind: "composition" }, tier }
}

export function findViolation(from: Location, to: Location, target: string): Violation | undefined {
  if (from.tier !== undefined && to.tier !== undefined && from.tier !== to.tier) {
    return "tierImportsTier"
  }

  switch (from.layer.kind) {
    case "shared":
      return to.layer.kind === "shared" ? undefined : "sharedImportsUp"
    case "feature":
      if (to.layer.kind === "shared") return undefined
      if (to.layer.kind === "feature") {
        return to.layer.name === from.layer.name ? undefined : "featureImportsFeature"
      }
      return "featureImportsComposition"
    case "route":
      return to.layer.kind === "route" && isModule(target) ? "routeImportsRoute" : undefined
    case "composition":
      return undefined
  }
}
