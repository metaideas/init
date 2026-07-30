# 0002: Require no external accounts by default

## Status

Accepted

## Decision

The template ships a wired and consumed core that requires no hosted service, API key,
or external account. Local development must work with the repository and its Docker
Compose services alone.

Hosted capabilities remain explicit workspace or generator selections. Their absence
must not leave required environment variables, imports, or broken builds.

## Consequences

Examples prefer local adapters and infrastructure. Selecting a hosted backend or
provider is a deliberate product decision made during or after scaffolding.
