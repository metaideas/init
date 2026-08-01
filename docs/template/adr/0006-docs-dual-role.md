# 0006: Use one documentation site for init and scaffolds

## Status

Accepted

## Decision

`apps/docs` is both the public init documentation site and the replaceable Starlight
example that ships when a scaffold owner selects the docs workspace.

Root `docs/` owns authored Markdown and MDX. The docs application owns presentation,
routing, navigation, search, metadata, localization behavior, styles, and static
assets. Its content collection publishes explicitly supported consumer documentation
from root `docs/` and excludes upstream governance, maintainer instructions, research,
and application decision records by default.

The site reads root documents directly through Astro's content loader. It does not
copy or synchronize a second content tree inside `apps/docs`.

## Consequences

The public site dogfoods the documentation workspace and scaffold conventions. A
scaffold owner who keeps `apps/docs` inherits a complete site backed by their root
documentation. An owner who omits it keeps the root Markdown and can still read or
replace that guidance independently.

This is an upstream template selection and governance choice. Decisions a scaffold
owner later makes about their application belong in `docs/adr/`; those records are not
published unless that owner explicitly changes the content policy.
