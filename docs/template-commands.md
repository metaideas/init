# Template Commands

Commands to manage the `init` template itself. These scripts help initialize, update, and maintain projects created from the template.

These commands wrap the `init-now` CLI. Use `bun run init:*` inside this repo, or run `init-now ...` directly if you have the CLI installed (or via `bunx init-now@latest`).

## Commands

### `bun run init:setup`

Initialize a new project from the template. This command:

- Prompts for a project name (defaults to "init")
- Allows selection of apps and packages to keep
- Removes unselected workspaces
- Updates project name references throughout the codebase
- Sets up environment files for selected workspaces
- Initializes a Git repository if one doesn't exist
- Cleans up internal template files
- Creates a new README
- Reinstalls dependencies

**Example:**

```bash
bun run init:setup
```

**Edge cases:**

- If Git is already initialized, it will skip Git initialization
- If `.env.local` files already exist, they won't be overwritten
- Project name "init" will skip renaming operations

### `bun run init:add:app`

Add a new app workspace to your monorepo. This command:

- Prompts for an app to add from the template
- Generates the app using Turbo generators

**Example:**

```bash
bun run init:add:app
```

### `bun run init:add:package`

Add a new package workspace to your monorepo. This command:

- Prompts for a package to add from the template
- Generates the package using Turbo generators

**Example:**

```bash
bun run init:add:package
```

### `bun run init:update`

Sync your project with the latest template updates. This command:

- Checks for the latest template release
- Compares with your current template version
- Clones the template repository
- Identifies files that need updating
- Only updates files that haven't been modified locally
- Only adds new files for existing workspaces
- Stages changes for review

**Example:**

```bash
bun run init:update
```

**Edge cases:**

- Requires a clean working tree (no uncommitted changes)
- Files with local modifications are skipped
- New files are only added if they belong to existing workspaces
- If already up to date, exits early

### Template Update Workflow

1. Ensure your working tree is clean with `git status`.
2. Run `bun run init:update`.
3. Review staged changes and adjust as needed.
4. Commit the update.

### `bun run init:check`

Check the current template version and compare it with the latest release.

**Example:**

```bash
bun run init:check
```

**Output:**

- Current template version (or "Unknown" if not set)
- Latest template version available
- Update status (up to date, update available, or local is newer)
- Release notes if an update is available

### `bun run init:rename`

Rename your project and update all `@init` references throughout the codebase.

**Example:**

```bash
bun run init:rename
```

**What it does:**

- Updates `package.json` name field
- Replaces all `@init` references with `@[new-name]`
- Also replaces previous project name references if not "init"
