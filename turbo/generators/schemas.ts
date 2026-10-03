import Bun from "bun"
import * as z from "zod"

const PackageJsonSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  name: z.string().optional(),
})

export async function readPackageJson(path: string) {
  const value: unknown = await Bun.file(path).json()
  assertPackageJson(value)

  return value
}

// Narrowing the original value instead of returning the parsed copy keeps the key order of manifests that are written back.
function assertPackageJson(value: unknown): asserts value is z.infer<typeof PackageJsonSchema> {
  PackageJsonSchema.parse(value)
}

export async function readPackageName(path: string) {
  const { name } = await readPackageJson(path)
  if (!name) throw new Error(`Expected ${path} to declare a package name.`)

  return name
}
