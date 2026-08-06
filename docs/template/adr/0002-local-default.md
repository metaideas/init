# 0002: Require no external accounts by default

## Status

Accepted

## Decision

The template includes an integrated core with no hosted service, API key, or external
account requirement. Local development must work with only the repository and its Docker
Compose services.

Hosted capabilities remain explicit workspace or template command selections. Their absence
must not leave required environment variables, imports, or failed builds.

## Consequences

Examples use local adapters and infrastructure. A scaffold owner selects a hosted backend alternative or
provider as a deliberate product decision during or after scaffolding.
