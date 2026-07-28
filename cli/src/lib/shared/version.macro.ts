import packageJson from "../../../package.json" with { type: "json" }

export function getPackageVersion(): string {
  if (!packageJson.version) throw new Error("Missing version in package.json")
  return packageJson.version
}
