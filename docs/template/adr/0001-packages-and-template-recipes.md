# 0001: Separate packages from template recipes

## Status

Accepted

## Decision

Use a package workspace for an ongoing dependency with third-party dependencies and a
lifecycle. Use a template recipe for code that the scaffold owner copies once, owns, and edits directly.

Package workspaces can remain selectable when the template has no built-in consumer.
Template recipes exist in the local `turbo/generators/` snapshot and never depend on a hosted catalog or independent updater.

## Consequences

Payments, AI, analytics, key-value storage, email clients, and similar integrations can
remain package workspaces. Email templates, small utilities, environment presets, UI additions,
and authentication snippets are template recipes when they have no independent runtime lifecycle.
