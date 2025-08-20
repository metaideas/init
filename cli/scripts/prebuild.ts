#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read package.json to get version
const packageJsonPath = join(__dirname, "..", "package.json")
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
const version = packageJson.version

// Generate version.ts file
const versionFileContent = `// This file is auto-generated during build
export const VERSION = "${version}"
`

// Ensure src directory exists
const srcDir = join(__dirname, "..", "src")
mkdirSync(srcDir, { recursive: true })

// Write version file
const versionFilePath = join(srcDir, "version.ts")
writeFileSync(versionFilePath, versionFileContent)

console.log(`Generated version.ts with version: ${version}`)
