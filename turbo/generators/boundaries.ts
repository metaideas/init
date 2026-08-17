import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

export type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  name?: string
}

export function requireAnswers(answers: PlopTypes.Answers | undefined) {
  if (!answers) throw new Error("Expected generator answers.")

  return answers
}

export function getAnswerString(answers: PlopTypes.Answers, key: string) {
  const value = answers[key]
  if (value === undefined || value === null || value.constructor !== String)
    throw new Error(`Expected generator answer ${key} to be a string.`)

  return String(value)
}

export function getAnswerBoolean(answers: PlopTypes.Answers, key: string) {
  const value = answers[key]
  if (value === undefined || value === null || value.constructor !== Boolean)
    throw new Error(`Expected generator answer ${key} to be a boolean.`)

  return Boolean(value)
}

export function getAnswerStrings(answers: PlopTypes.Answers, key: string) {
  const value = answers[key]
  if (Array.isArray(value) && value.every((entry) => entry?.constructor === String))
    return value.map(String)
  if (value?.constructor === String) return [String(value)]

  throw new Error(`Expected generator answer ${key} to contain strings.`)
}

export async function readPackageJson(path: string): Promise<PackageJson> {
  const value: unknown = JSON.parse(await Bun.file(path).text())
  if (value === null || !(value instanceof Object) || Array.isArray(value))
    throw new Error(`Expected ${path} to contain a JSON object.`)

  if ("dependencies" in value) {
    const dependencies = value.dependencies
    if (
      dependencies !== undefined &&
      (dependencies === null ||
        !(dependencies instanceof Object) ||
        Array.isArray(dependencies) ||
        !Object.values(dependencies).every((version) => version?.constructor === String))
    )
      throw new Error(`Expected ${path} dependencies to map package names to versions.`)
  }
  if ("devDependencies" in value) {
    const devDependencies = value.devDependencies
    if (
      devDependencies !== undefined &&
      (devDependencies === null ||
        !(devDependencies instanceof Object) ||
        Array.isArray(devDependencies) ||
        !Object.values(devDependencies).every((version) => version?.constructor === String))
    )
      throw new Error(`Expected ${path} devDependencies to map package names to versions.`)
  }
  if ("name" in value && value.name !== undefined && value.name?.constructor !== String)
    throw new Error(`Expected ${path} name to be a string.`)

  return value
}

export async function readPackageName(path: string) {
  const packageJson = await readPackageJson(path)
  if (!packageJson.name) throw new Error(`Expected ${path} to declare a package name.`)

  return packageJson.name
}
