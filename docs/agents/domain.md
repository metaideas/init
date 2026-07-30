# Domain documentation

Use the repository's domain documentation before exploring code or recording a
decision.

## Before exploring

1. Read the root `CONTEXT.md`.
2. Read the relevant document under `docs/architecture/`.
3. Read decision records that affect the area, if their directories exist.

Use glossary terms consistently in issues, implementation plans, code, and decision
records. If a needed concept is missing, verify that it is a real domain distinction
before adding vocabulary.

## Decision routing

- In this upstream template, selection and governance decisions belong in
  `docs/template/adr/`.
- Decisions made by the owner of an application belong in `docs/adr/`.
- If `docs/template/` does not exist, only the application route remains.

Do not present an upstream template choice as if a scaffold owner made it. If new work
contradicts an existing decision, surface the conflict explicitly rather than silently
overwriting the record.
