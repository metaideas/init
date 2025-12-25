import Bun from "bun"
import consola from "consola"
import { defineCommand } from "../helpers"
import { replaceProjectNameInProjectFiles, workspaces } from "./utils"

async function removeUnselectedWorkspaces(apps: string[], packages: string[]) {
  const appsToRemove = workspaces.apps
    .filter((app) => !apps.includes(app.name))
    .map((app) => `apps/${app.name}`)
  const packagesToRemove = workspaces.packages
    .filter((pkg) => !packages.includes(pkg.name))
    .map((pkg) => `packages/${pkg.name}`)

  const tasks = [...appsToRemove, ...packagesToRemove].map(async (path) => {
    try {
      await Bun.$`rm -rf ${path}`.quiet()
    } catch {
      // Failed to remove directory, continuing...
    }
  })

  await Promise.all(tasks)
}

async function updatePackageJson(projectName: string) {
  const packageJson = await Bun.file("package.json").json()

  packageJson.name = projectName
  packageJson.version = "0.0.1"
  await Bun.write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`)
}

async function setupEnvironmentVariables(paths: string[]) {
  const tasks = paths.map(async (workspacePath) => {
    try {
      const templatePath = `${workspacePath}/.env.template`
      const localPath = `${workspacePath}/.env.local`

      // Check if .env.local already exists
      if (await Bun.file(localPath).exists()) {
        return
      }

      // Try to copy .env.template to .env.local
      await Bun.write(localPath, await Bun.file(templatePath).text())
    } catch {
      // Do nothing for now
    }
  })

  await Promise.all(tasks)
}

async function setupGit() {
  // Check if git repo exists by checking if .git directory exists
  if (await Bun.file(".git").exists()) {
    return
  }

  try {
    await Bun.$`git init`
  } catch (error) {
    throw new Error(`Failed to initialize Git: ${error}`)
  }
}

async function cleanupInternalFiles() {
  const filesToRemove = [
    "release-please-config.json",
    ".github/workflows/release.yml",
    "__tests__",
    "cli",
  ]

  const tasks = filesToRemove.map(async (file) => {
    try {
      await Bun.$`rm -rf ${file}`.quiet()
    } catch {
      // File doesn't exist or failed to remove, continuing...
    }
  })

  await Promise.all(tasks)
}

async function createNewReadme(projectName: string) {
  await Bun.write(
    "README.md",
    `
<div align="center">
  <h1 align="center"><code>${projectName}</code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `
  )
}

type PackageManager = "bun" | "npm" | "yarn" | "pnpm"

async function detectPackageManager(): Promise<PackageManager> {
  // Check for lockfiles to detect package manager
  if (await Bun.file("bun.lockb").exists()) {
    return "bun"
  }
  if (await Bun.file("pnpm-lock.yaml").exists()) {
    return "pnpm"
  }
  if (await Bun.file("yarn.lock").exists()) {
    return "yarn"
  }
  if (await Bun.file("package-lock.json").exists()) {
    return "npm"
  }

  // Check package.json for packageManager field
  try {
    const packageJson = await Bun.file("package.json").json()
    if (packageJson.packageManager) {
      const manager = packageJson.packageManager.split("@")[0]
      if (["bun", "npm", "yarn", "pnpm"].includes(manager)) {
        return manager as PackageManager
      }
    }
  } catch {
    // Continue with default
  }

  // Default to bun
  return "bun"
}

interface WorkflowStep {
  name: string
  uses?: string
  with?: Record<string, string>
  run?: string
}

interface WorkflowJob {
  "runs-on": string
  steps: WorkflowStep[]
}

function generateGitHubActionWorkflow(packageManager: PackageManager, checks: string[]) {
  const setupStep = {
    bun: {
      name: "Setup Bun",
      action: "oven-sh/setup-bun@v2",
      version: "latest",
    },
    npm: {
      name: "Setup Node.js",
      action: "actions/setup-node@v4",
      version: "24",
    },
    yarn: {
      name: "Setup Node.js",
      action: "actions/setup-node@v4",
      version: "24",
    },
    pnpm: {
      name: "Setup pnpm",
      action: "pnpm/action-setup@v4",
      version: "latest",
    },
  }[packageManager]

  const installCommand = {
    bun: "bun install",
    npm: "npm ci",
    yarn: "yarn install --frozen-lockfile",
    pnpm: "pnpm install --frozen-lockfile",
  }[packageManager]

  const runCommand = {
    bun: "bun run",
    npm: "npm run",
    yarn: "yarn",
    pnpm: "pnpm",
  }[packageManager]

  const jobs: Record<string, WorkflowJob> = {}

  // Add lint job if check script exists
  if (checks.includes("check")) {
    jobs.lint = {
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        packageManager === "pnpm"
          ? {
              name: setupStep.name,
              uses: setupStep.action,
            }
          : {
              name: setupStep.name,
              uses: setupStep.action,
              with:
                packageManager === "bun"
                  ? { "bun-version": setupStep.version }
                  : { "node-version": setupStep.version },
            },
        packageManager === "pnpm"
          ? {
              name: "Setup Node.js",
              uses: "actions/setup-node@v4",
              with: { "node-version": "24", cache: "pnpm" },
            }
          : null,
        {
          name: "Install dependencies",
          run: installCommand,
        },
        checks.includes("typegen")
          ? {
              name: "Generate types",
              run: `${runCommand} typegen`,
            }
          : null,
        {
          name: "Run linting",
          run: `${runCommand} check`,
        },
      ].filter(Boolean),
    }
  }

  // Add typecheck job if typecheck script exists
  if (checks.includes("typecheck")) {
    jobs.typecheck = {
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        packageManager === "pnpm"
          ? {
              name: setupStep.name,
              uses: setupStep.action,
            }
          : {
              name: setupStep.name,
              uses: setupStep.action,
              with:
                packageManager === "bun"
                  ? { "bun-version": setupStep.version }
                  : { "node-version": setupStep.version },
            },
        packageManager === "pnpm"
          ? {
              name: "Setup Node.js",
              uses: "actions/setup-node@v4",
              with: { "node-version": "24", cache: "pnpm" },
            }
          : null,
        {
          name: "Install dependencies",
          run: installCommand,
        },
        checks.includes("typegen")
          ? {
              name: "Generate types",
              run: `${runCommand} typegen`,
            }
          : null,
        {
          name: "Run type checking",
          run: `${runCommand} typecheck`,
        },
      ].filter(Boolean),
    }
  }

  // Add test job if test script exists
  if (checks.includes("test")) {
    jobs.test = {
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        packageManager === "pnpm"
          ? {
              name: setupStep.name,
              uses: setupStep.action,
            }
          : {
              name: setupStep.name,
              uses: setupStep.action,
              with:
                packageManager === "bun"
                  ? { "bun-version": setupStep.version }
                  : { "node-version": setupStep.version },
            },
        packageManager === "pnpm"
          ? {
              name: "Setup Node.js",
              uses: "actions/setup-node@v4",
              with: { "node-version": "24", cache: "pnpm" },
            }
          : null,
        {
          name: "Install dependencies",
          run: installCommand,
        },
        {
          name: "Run tests",
          run: `${runCommand} test`,
        },
      ].filter(Boolean),
    }
  }

  // Add build job if build script exists
  if (checks.includes("build")) {
    jobs.build = {
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        packageManager === "pnpm"
          ? {
              name: setupStep.name,
              uses: setupStep.action,
            }
          : {
              name: setupStep.name,
              uses: setupStep.action,
              with:
                packageManager === "bun"
                  ? { "bun-version": setupStep.version }
                  : { "node-version": setupStep.version },
            },
        packageManager === "pnpm"
          ? {
              name: "Setup Node.js",
              uses: "actions/setup-node@v4",
              with: { "node-version": "24", cache: "pnpm" },
            }
          : null,
        {
          name: "Install dependencies",
          run: installCommand,
        },
        checks.includes("typegen")
          ? {
              name: "Generate types",
              run: `${runCommand} typegen`,
            }
          : null,
        {
          name: "Build project",
          run: `${runCommand} build`,
        },
      ].filter(Boolean),
    }
  }

  const workflow = {
    name: "CI",
    on: {
      push: {
        branches: ["main"],
      },
      pull_request: {
        branches: ["main"],
      },
    },
    jobs,
  }

  return workflow
}

async function setupGitHubAction() {
  const shouldSetup = await consola.prompt("Do you want to enable a GitHub Action for CI checks?", {
    type: "confirm",
    initial: true,
    cancel: "undefined",
  })

  if (shouldSetup === undefined || !shouldSetup) {
    return
  }

  // Detect package manager
  const packageManager = await detectPackageManager()
  consola.info(`Detected package manager: ${packageManager}`)

  // Read package.json to check available scripts
  const packageJson = await Bun.file("package.json").json()
  const scripts = packageJson.scripts || {}

  // Determine available checks
  const availableChecks: string[] = []
  const checkScripts = ["check", "typecheck", "test", "build", "typegen"]

  for (const script of checkScripts) {
    if (scripts[script]) {
      availableChecks.push(script)
    }
  }

  if (availableChecks.length === 0) {
    consola.warn("No CI checks found in package.json scripts. Skipping GitHub Action setup.")
    return
  }

  // Ask which checks to enable (exclude typegen from user selection as it's a dependency)
  const checksToPrompt = availableChecks.filter((check) => check !== "typegen")

  if (checksToPrompt.length === 0) {
    consola.warn("No CI checks available. Skipping GitHub Action setup.")
    return
  }

  const selectedChecks = await consola.prompt("Select which checks to run in GitHub Actions", {
    type: "multiselect",
    options: checksToPrompt.map((check) => ({
      label: check,
      value: check,
    })),
    initial: checksToPrompt,
    cancel: "undefined",
  })

  if (selectedChecks === undefined || selectedChecks.length === 0) {
    consola.warn("No checks selected. Skipping GitHub Action setup.")
    return
  }

  // Fix type issue with multiselect
  const checks = selectedChecks.map((check: string | { value: string }) =>
    typeof check === "string" ? check : check.value
  )

  // Add typegen if it exists (as it's needed by other checks)
  if (availableChecks.includes("typegen")) {
    checks.push("typegen")
  }

  // Generate workflow
  const workflow = await generateGitHubActionWorkflow(packageManager, checks)

  // Ensure .github/workflows directory exists
  await Bun.$`mkdir -p .github/workflows`.quiet()

  // Convert workflow to YAML manually (simple approach)
  const yamlContent = `name: ${workflow.name}

on:
  push:
    branches:
${workflow.on.push.branches.map((b: string) => `      - ${b}`).join("\n")}
  pull_request:
    branches:
${workflow.on.pull_request.branches.map((b: string) => `      - ${b}`).join("\n")}

jobs:
${Object.entries(workflow.jobs)
  .map(([jobName, job]: [string, WorkflowJob]) => {
    const steps = job.steps
      .map((step: WorkflowStep) => {
        let stepYaml = `      - name: ${step.name}\n`
        if (step.uses) {
          stepYaml += `        uses: ${step.uses}\n`
        }
        if (step.with) {
          stepYaml += "        with:\n"
          for (const [key, value] of Object.entries(step.with)) {
            stepYaml += `          ${key}: ${value}\n`
          }
        }
        if (step.run) {
          stepYaml += `        run: ${step.run}\n`
        }
        return stepYaml
      })
      .join("\n")

    return `  ${jobName}:
    runs-on: ${job["runs-on"]}

    steps:
${steps}`
  })
  .join("\n\n")}
`

  await Bun.write(".github/workflows/ci.yml", yamlContent)
  consola.success("GitHub Action workflow created at .github/workflows/ci.yml")
}

export default defineCommand({
  command: "init",
  describe: "Initialize project and clean up template files",
  handler: async () => {
    consola.info("Starting project setup...")

    try {
      const projectName = await consola.prompt(
        "Enter your project name (for @[project-name] monorepo alias). Leave as 'init' or empty to skip renaming.",
        {
          type: "text",
          default: "init",
          placeholder: "init",
          cancel: "undefined",
        }
      )

      if (projectName === undefined) {
        throw new Error("Setup cancelled. No changes have been made.")
      }

      const selectedApps = await consola.prompt(
        "Select apps to keep (all others will be removed)",
        {
          type: "multiselect",
          options: workspaces.apps.map((app) => ({
            label: app.description,
            value: app.name,
          })),
          cancel: "undefined",
        }
      )

      if (selectedApps === undefined) {
        throw new Error("Setup cancelled. No changes have been made.")
      }

      // Fix an issue with the type returned by the multiselect prompt
      const apps = selectedApps.map((app) => (typeof app === "string" ? app : app.value))

      // Get all package dependencies from selected apps
      const requiredPackages = new Set<string>()
      for (const app of apps) {
        const foundApp = workspaces.apps.find((a) => a.name === app)
        if (foundApp?.dependencies) {
          for (const dep of foundApp.dependencies) {
            requiredPackages.add(dep)
          }
        }
      }

      const selectedPackages = await consola.prompt(
        "Select packages to keep (all others will be removed). We've automatically selected packages that are required by the selected apps.",
        {
          type: "multiselect",
          options: workspaces.packages.map((pkg) => ({
            label: pkg.description,
            value: pkg.name,
          })),
          initial: Array.from(requiredPackages),
          cancel: "undefined",
        }
      )

      if (selectedPackages === undefined) {
        throw new Error("Setup cancelled. No changes have been made.")
      }

      // Fix an issue with the type returned by the multiselect prompt
      const packages = selectedPackages.map((pkg) => (typeof pkg === "string" ? pkg : pkg.value))

      await removeUnselectedWorkspaces(apps, packages)

      if (projectName !== "init") {
        consola.start("Updating project name in package.json...")
        await updatePackageJson(projectName)
        consola.success("Project name updated in package.json.")

        consola.start("Replacing @init with project name in project files...")
        await replaceProjectNameInProjectFiles(projectName)
        consola.success("Project name replaced in project files.")
      }

      consola.start("Setting up environment files for workspaces...")
      await setupEnvironmentVariables([
        ...apps.map((app) => `apps/${app}`),
        ...packages.map((pkg) => `packages/${pkg}`),
      ])
      consola.success("Environment files setup complete.")

      consola.start("Initializing Git repository...")
      await setupGit()
      consola.success("Git repository initialized.")

      consola.start("Cleaning up internal template files...")
      await cleanupInternalFiles()
      consola.success("Internal template files removed.")

      consola.start("Creating new README...")
      await createNewReadme(projectName)
      consola.success("README created.")

      consola.start("Setting up GitHub Action...")
      await setupGitHubAction()
      consola.success("GitHub Action setup complete.")

      consola.start("Re-installing dependencies...")
      await Bun.$`bun install`
      consola.success("Dependencies installed.")

      consola.success("🎉 All setup steps complete! Your project is ready.")
    } catch (error) {
      consola.error(`Operation cancelled: ${error}`)
      process.exit(1)
    }
  },
})
