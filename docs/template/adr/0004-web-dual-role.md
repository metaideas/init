# 0004: Use one marketing app for init and scaffolds

## Status

Accepted

## Decision

`apps/web` is the public `init.now` site and an Astro marketing example. The template includes the example when a scaffold owner selects the web workspace.

Hosting project independence is a concern for deployment. It does not require a second source tree, lockfile, or dependency graph.

## Consequences

The public site uses the template build and workspace conventions. Scaffold owners receive a complete example that they can brand, replace, or omit through the standard workspace selection flow.
