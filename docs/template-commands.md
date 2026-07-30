# Template Commands

Commands for configuring and extending projects created with `bun create metaideas/init <name>`.

## Commands

### `bun template setup`

Configure a newly created project. This command:

- Prompts for the apps and packages to keep
- Sets the project name, which is also used as the package scope
- Rewrites `@init/` references with the project name
- Stamps `.template.json` with the source template, commit, and creation time

```bash
bun template setup
```

### `bun template rename`

Rename the project and rewrite its `@init/` package scope references.

```bash
bun template rename --name <name> [--scope <scope>]
```

### `bun template add app <name>`

Copy an app workspace from the template using Turbo generators, then apply the project's package scope.

```bash
bun template add app web
```

### `bun template add package <name>`

Copy a package workspace from the template using Turbo generators, then apply the project's package scope.

```bash
bun template add package auth
```

## Project scripts

`bun run scripts` is the extensible entry point for scripts owned by your project.

There is no automated template `update` or `check` command. See [Updating your project](../README.md#updating-your-project) for the agent-driven update workflow.
