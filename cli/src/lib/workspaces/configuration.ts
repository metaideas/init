import { basename } from "node:path"
import process from "node:process"
import * as Effect from "effect/Effect"
import { InvalidWorkspaceSelection } from "#lib/core/errors.ts"
import { getProjectNameValidationError } from "#lib/projects/files.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { getWorkspacesByType, type TemplateManifest } from "#lib/templates/manifest.ts"
import { parseWorkspaceList, resolveSelection } from "#lib/workspaces/selection.ts"

export type WorkspaceConfigurationFlags = {
  readonly apps?: readonly string[]
  readonly packages?: readonly string[]
}

export type WorkspaceConfiguration = {
  readonly projectName: string
  readonly selected: ReadonlySet<string>
}

function getInvalidWorkspaceIds(
  manifest: TemplateManifest,
  type: "app" | "package",
  selected: readonly string[] | undefined
) {
  if (selected === undefined) return []
  const workspaceIds = new Set(
    manifest.workspaces
      .filter((workspace) => workspace.type === type)
      .map((workspace) => workspace.id)
  )
  return selected.filter((id) => !workspaceIds.has(id))
}

const chooseWorkspacePlan = Effect.fn("chooseWorkspacePlan")(function* (
  manifest: TemplateManifest,
  providedApps: readonly string[] | undefined,
  providedPackages: readonly string[] | undefined,
  yes: boolean
) {
  const prompter = yield* Prompter
  const appWorkspaces = getWorkspacesByType(manifest, "app")
  const packageWorkspaces = getWorkspacesByType(manifest, "package")
  let initialApps = providedApps ? [...providedApps] : undefined
  let initialPackages = providedPackages ? [...providedPackages] : undefined
  let previousApps: string[] | undefined
  let previousPackages: string[] | undefined

  for (;;) {
    const selectedApps =
      initialApps ??
      (yes
        ? appWorkspaces.map((workspace) => workspace.id)
        : yield* prompter.multiselect({
            initialValues: previousApps,
            message: "Select apps to keep (all others will be removed)",
            options: appWorkspaces.map((workspace) => ({
              hint: workspace.description,
              label: workspace.id,
              value: workspace.id,
            })),
            required: false,
          }))
    const appPlan = resolveSelection(manifest, new Set(selectedApps))
    if (appPlan.dangling.length > 0) {
      return yield* Effect.fail(
        new InvalidWorkspaceSelection({ details: appPlan.dangling.join("\n") })
      )
    }
    const requiredPackages = packageWorkspaces
      .filter((workspace) => appPlan.selected.has(workspace.id))
      .map((workspace) => workspace.id)
    const chosenPackages =
      initialPackages ??
      (yes
        ? requiredPackages
        : yield* prompter.multiselect({
            initialValues: [...new Set([...requiredPackages, ...(previousPackages ?? [])])],
            message:
              "Select packages to keep. Packages required by selected apps are retained automatically.",
            options: packageWorkspaces.map((workspace) => ({
              disabled: appPlan.requiredReasons.has(workspace.id),
              hint: appPlan.requiredReasons.has(workspace.id)
                ? `${workspace.description} (required)`
                : workspace.description,
              label: workspace.id,
              value: workspace.id,
            })),
            required: false,
          }))
    const plan = resolveSelection(
      manifest,
      new Set([...selectedApps, ...chosenPackages, ...requiredPackages])
    )
    if (plan.dangling.length > 0) {
      return yield* Effect.fail(
        new InvalidWorkspaceSelection({ details: plan.dangling.join("\n") })
      )
    }
    if (plan.recommendations.length === 0) return plan

    const recommendationSummary = plan.recommendations
      .map(
        (recommendation) =>
          `${recommendation.source} → ${recommendation.target}: ${recommendation.reason}`
      )
      .join("\n")
    yield* prompter.log.warning(`Unfulfilled recommendations:\n${recommendationSummary}`)
    if (yes) return plan

    const action = yield* prompter.select({
      message: "How would you like to handle these recommendations?",
      options: [
        { label: "Return to app and package selection", value: "return" },
        { label: "Continue without recommendations", value: "continue" },
      ],
    })
    if (action === "continue") return plan
    initialApps = undefined
    initialPackages = undefined
    previousApps = selectedApps
    previousPackages = chosenPackages
  }
})

export const validateWorkspaceFlags = Effect.fn("validateWorkspaceFlags")(function* (
  manifest: TemplateManifest,
  options: {
    readonly apps?: string
    readonly packages?: string
  }
) {
  const apps = parseWorkspaceList(options.apps)
  const packages = parseWorkspaceList(options.packages)

  const invalidApps = getInvalidWorkspaceIds(manifest, "app", apps)
  if (invalidApps.length > 0) {
    return yield* Effect.fail(
      new InvalidWorkspaceSelection({
        details: `Unknown app${invalidApps.length === 1 ? "" : "s"}: ${invalidApps.join(", ")}`,
      })
    )
  }
  const invalidPackages = getInvalidWorkspaceIds(manifest, "package", packages)
  if (invalidPackages.length > 0) {
    return yield* Effect.fail(
      new InvalidWorkspaceSelection({
        details: `Unknown package${invalidPackages.length === 1 ? "" : "s"}: ${invalidPackages.join(", ")}`,
      })
    )
  }

  return { apps, packages } satisfies WorkspaceConfigurationFlags
})

export const selectWorkspaceConfiguration = Effect.fn("selectWorkspaceConfiguration")(function* (
  manifest: TemplateManifest,
  options: WorkspaceConfigurationFlags & {
    readonly name?: string
    readonly yes: boolean
  }
) {
  const prompter = yield* Prompter
  const currentDirectoryName = basename(process.cwd()) || "init"
  const projectName = (
    options.name ??
    (options.yes
      ? currentDirectoryName
      : yield* prompter.text({
          defaultValue: currentDirectoryName,
          message: "Enter your project name (for @[project-name] monorepo alias):",
          validate: getProjectNameValidationError,
        }))
  ).trim()
  const validationError = getProjectNameValidationError(projectName)
  if (validationError) {
    return yield* Effect.fail(new InvalidWorkspaceSelection({ details: validationError }))
  }

  const plan = yield* chooseWorkspacePlan(manifest, options.apps, options.packages, options.yes)
  return {
    projectName,
    selected: plan.selected,
  } satisfies WorkspaceConfiguration
})
