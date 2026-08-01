---
title: Template Commands
description: Configure, rename, and extend scaffolded init projects with local template commands.
---

Commands for configuring and extending projects created with `bun create metaideas/init <name>`.

## Commands

### `bun template setup`

Configure a newly created project. This command:

- Prompts for the apps and packages to keep
- Sets the project name, which is also used as the package scope
- Rewrites `@init/` references with the project name
- Sets package-local Portless route names from the normalized package scope
- Stamps `.template.json` with the source template, commit, and creation time

```bash
bun template setup
```

### `bun template rename`

Rename the project, rewrite its package scope references, and update its Portless
hostnames.

```bash
bun template rename --name <name> [--scope <scope>]
```

### `bun template add app <name>`

Copy an app workspace from the template using Turbo generators, apply the project's
package scope, and restore its Portless route configuration.

```bash
bun template add app web
```

### `bun template add package <name>`

Copy a package workspace from the template using Turbo generators, apply the project's
package scope, and restore its Portless route configuration when it owns a local UI.

```bash
bun template add package auth
```

## Project scripts

`bun run scripts` is the extensible entry point for scripts owned by your project.

## Updating Your Project

`bun template setup` creates `.template.json` with the template repository, the commit
used to create the project, and the creation time:

```json
{ "template": "metaideas/init", "commit": "<sha>", "createdAt": "<ISO date>" }
```

There is no automated template `update` or `check` command. To bring in template
improvements, ask your coding agent to compare
[metaideas/init](https://github.com/metaideas/init) from the stamped commit to `HEAD`
and apply the changes that are relevant to your project. Tell it to propagate upstream
deletions and normalize your renamed scope before diffing: local `@<scope>/` references
correspond to upstream `@init/` references.
