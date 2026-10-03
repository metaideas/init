<div align="center">
  <h1 align="center"><code>@init/core</code></h1>
</div>

Core business logic, organized by domain.

```sh
src/
  ├── domains/          # Business rules, one folder per domain (e.g. auth)
  │   └── [domain]/       # Exported as @init/core/domains/[domain]
  ├── services/         # Contracts for external capabilities (e.g. email)
  │   └── [service]/      # Exported as @init/core/services/[service]
  ├── shared/           # Code that domains and services both use
  └── errors.ts         # Every error and the merged AppFault registry
```

A domain describes what the business allows, such as who a user is and what they may do. A service describes a capability that infrastructure provides, such as sending email, and how it fails. `shared` never imports from `domains` or `services`. Do not organize this package by product feature; feature folders belong to application workspaces.
