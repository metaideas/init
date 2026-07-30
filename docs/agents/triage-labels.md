# Triage labels

| Skill role        | Repository label  | Meaning                                            |
| ----------------- | ----------------- | -------------------------------------------------- |
| `needs-triage`    | `needs-triage`    | A maintainer needs to evaluate the issue           |
| `needs-info`      | `needs-info`      | More information is required from the reporter     |
| `ready-for-agent` | `ready-for-agent` | Fully specified and suitable for autonomous work   |
| `ready-for-human` | `ready-for-human` | Requires maintainer judgment or external authority |
| `wontfix`         | `wontfix`         | The repository will not action the issue           |

This file is upstream wiring. `bun template setup` removes it so scaffold owners can
configure vocabulary for their own tracker.
