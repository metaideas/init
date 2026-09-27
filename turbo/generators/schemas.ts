import Bun from "bun"
import * as z from "zod"

export const StringListSchema = z.union([
  z.array(z.string()),
  z.string().transform((value) => value.split(",").map((entry) => entry.trim())),
])

const PackageJsonSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  name: z.string().optional(),
})

export async function readPackageJson(path: string) {
  const value: unknown = await Bun.file(path).json()
  PackageJsonSchema.parse(value)

  // SAFETY: the schema accepted the value. Returning the original keeps the key order of manifests that are written back.
  return value as z.infer<typeof PackageJsonSchema>
}

export async function readPackageName(path: string) {
  const { name } = await readPackageJson(path)
  if (!name) throw new Error(`Expected ${path} to declare a package name.`)

  return name
}
