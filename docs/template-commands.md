# Template Commands

Commands to manage the `init` template itself. These scripts help initialize, update, and maintain projects created from the template.

## Commands

### `bun template init`

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
bun template init
```

**Edge cases:**

- If Git is already initialized, it will skip Git initialization
- If `.env.local` files already exist, they won't be overwritten
- Project name "init" will skip renaming operations

### `bun template add`

Add new workspaces (apps or packages) to your monorepo. This command:

- Prompts for workspace type (app or package)
- Lists available workspaces from the template
- Generates the workspace using Turbo generators

**Example:**

```bash
bun template add
```

### `bun template update`

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
bun template update
```

**Edge cases:**

- Requires a clean working tree (no uncommitted changes)
- Files with local modifications are skipped
- New files are only added if they belong to existing workspaces
- If already up to date, exits early

### `bun template check`

Check the current template version and compare it with the latest release.

**Example:**

```bash
bun template check
```

**Output:**

- Current template version (or "Unknown" if not set)
- Latest template version available
- Update status (up to date, update available, or local is newer)
- Release notes if an update is available

### `bun template rename`

Rename your project and update all `@init` references throughout the codebase.

**Example:**

```bash
bun template rename
```

**What it does:**

- Updates `package.json` name field
- Replaces all `@init` references with `@[new-name]`
- Also replaces previous project name references if not "init"
