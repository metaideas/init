# 0004: Use one marketing app for init and scaffolds

## Status

Accepted

## Decision

`apps/web` is both the public `init.now` site and the replaceable Astro marketing
example that ships when a scaffold owner selects the web workspace.

Deployment independence is a hosting-project concern, not a reason for a second source
tree, lockfile, or dependency graph.

## Consequences

The public site dogfoods the template's build and workspace conventions. Scaffold owners
receive a polished example they can brand, replace, or omit through the normal
workspace-selection flow.
