---
name: update-from-template
description: Pull improvements from the upstream init template into a scaffolded project. Use when the user asks to update, sync, or upgrade the template, or to see what changed upstream.
---

`.template.json` records the template commit this project was created from. `bun template diff` fetches upstream and prints what changed since then, with the template scope already rewritten to this project's scope so hunks apply locally.

1. Survey:

   ```bash
   bun template diff --name-only
   ```

   Drop files under workspaces this project removed. Group the rest by workspace.

2. Read the patch for the remaining files with `bun template diff`. For each hunk decide: apply as is, adapt because the project changed the same code, or skip because it does not fit the product. Apply upstream deletions too.
3. When the diff touches a `package.json`, run `bun install`. When it touches an `.env.schema` or a package `env/` fragment, run `bun run codegen`.
4. Record the new baseline so the next run starts from here:

   ```bash
   bun template diff --update-stamp > /dev/null
   ```

5. Run `bun template doctor` and fix what it reports. Finish when it passes and report what was applied, adapted, and skipped.
