export const REMOTE_URL = "git@github.com:metaideas/init.git"
export const REMOTE_HTTPS_URL = "https://github.com/metaideas/init.git"
export const TEMPLATE_VERSION_FILE = ".template-version"
export const TEMP_DIR = ".template-sync-tmp"

export const TEMPLATE_VERSION = "0.3.1"

export const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".vercel",
  ".DS_Store",
  ".cache",
  ".pnpm-store",
  ".yarn",
  "scripts",
] as const