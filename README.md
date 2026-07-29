<div align="center">
  <h1 align="center">▶︎ <code>init</code></h1>

  <p align="center">
    <em><strong>Start once, ship everything.</strong></em>
  </p>

  <p align="center">
    <code>bun create metaideas/init my-app</code>
  </p>
</div>

A modern monorepo template for shipping TypeScript apps everywhere: web, mobile, desktop, browser extensions, and more.

## What's included

- Fullstack application using [TanStack Start](https://tanstack.com/start)
- Marketing site and blog using [Astro](https://astro.build/)
- Documentation site using [Astro](https://astro.build/) with [Starlight](https://starlight.astro.build/)
- Mobile application using [Expo](https://expo.dev/)
- API with [Hono](https://hono.dev/) and [TRPC](https://trpc.io/)
- Desktop application using [Tauri](https://tauri.app/)
- Browser extension using [WXT](https://wxt.dev/)

## Template commands

Template commands configure and extend a project created from this repository:

| Command                           | Description                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `bun template setup`              | Configure the project: choose apps and packages, set its name and scope, and stamp the template version. |
| `bun template rename`             | Rename the project and rewrite the `@init/` scope.                                                       |
| `bun template add app <name>`     | Copy an app workspace from the template with Turbo generators.                                           |
| `bun template add package <name>` | Copy a package workspace from the template with Turbo generators.                                        |

## Quickstart

```bash
bun create metaideas/init my-app
cd my-app
bun template setup
bun run dev
```

`bun run scripts` is the extensible entry point for scripts owned by your project.

## Updating your project

`bun template setup` creates `.template.json` with the template repository, the commit used to create the project, and the creation time:

```json
{ "template": "metaideas/init", "commit": "<sha>", "createdAt": "<ISO date>" }
```

To bring in template improvements, ask your coding agent to compare
[metaideas/init](https://github.com/metaideas/init) from the stamped commit to `HEAD` and apply the changes that are relevant to your project. Tell it to propagate upstream deletions and to normalize your renamed scope before diffing: local `@<scope>/` references correspond to upstream `@init/` references. This prevents project renames from appearing as unrelated edits.

## Documentation

- [Getting Started](https://github.com/metaideas/init/blob/main/docs/getting-started.md)
- [Development](https://github.com/metaideas/init/blob/main/docs/development.md)
- [Project Structure](https://github.com/metaideas/init/blob/main/docs/project-structure.md)
