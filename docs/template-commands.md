---
title: Template Commands
description: Configure, rename, and extend scaffolded projects from init with local template commands.
---

Use these template commands to configure and extend projects created with `bun create metaideas/init <name>`.

## Commands

### `bun template setup`

Configure a newly created project. This command does the following:

- It prompts you to select the application and package workspaces to keep.
- It sets the project name, which is also the package scope.
- It rewrites `@init/` references with the project name.
- It rewrites the `.localhost` hostnames in the environment files and `infra/local/Caddyfile` from the normalized package scope.
- It records the source template, commit, and creation time in `.template.json`.

```bash
bun template setup
```

### `bun template rename`

Rename the project. Rewrite its package scope references. Update its `.localhost` hostnames, including the `infra/local/Caddyfile` routes.

```bash
bun template rename --name <name> [--scope <scope>]
```

### `bun template add app <name>`

Copy an application workspace from the template with Turbo generators. Apply the package scope of the project. When the workspace serves HTTP in development, add its route to `infra/local/Caddyfile`.

```bash
bun template add app web
```

### `bun template add package <name>`

Copy a package workspace from the template with Turbo generators. Apply the package scope of the project. When it owns a local UI, add its route to `infra/local/Caddyfile`.

```bash
bun template add package auth
```

## Project scripts

`bun run scripts` is the extensible entry point for scripts that the project owns.

## Updating Your Project

`bun template setup` creates `.template.json`. The file contains the template repository, the commit used to create the project, and the creation time:

```json
{ "template": "metaideas/init", "commit": "<sha>", "createdAt": "<ISO date>" }
```

There is no automated template `update` or `check` command. To add template improvements, ask the coding agent to compare [metaideas/init](https://github.com/metaideas/init) from the recorded commit to `HEAD`. Ask it to apply changes that are relevant to the project. Before it compares the code, tell it to propagate upstream deletions. Tell it to normalize the renamed scope. Local `@<scope>/` references correspond to upstream `@init/` references.
