# 0001: Separate packages from template recipes

## Status

Accepted

## Decision

Use a package workspace for an ongoing dependency with its own third-party dependencies
and lifecycle. Use a template recipe for copy-once code that the scaffold owner should
own and edit directly.

Packages may remain selectable even when the upstream template has no built-in consumer.
Recipes live in the local `turbo/generators/` snapshot and never depend on a hosted
catalog or independent updater.

## Consequences

Payments, AI, analytics, key-value storage, email clients, and similar integrations can
remain packages. Email templates, small utilities, environment presets, UI additions,
and auth snippets belong in generators when they have no independent runtime lifecycle.
