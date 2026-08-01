# init

init is a TypeScript monorepo template from which developers select the application and
package workspaces needed for their product.

## Language

**Template**:
The upstream `metaideas/init` repository before installation. It includes the product
scaffold and maintainer-only material.
_Avoid_: Starter, boilerplate

**Scaffolded project**:
An independently owned repository created and configured from the template.
_Avoid_: Template instance, downstream template

**Workspace**:
A selectable application or reusable package included in a scaffolded project.
_Avoid_: Module, project

**Application workspace**:
A user-facing or independently runnable product surface.
_Avoid_: App package

**Package workspace**:
Runtime code shared by application workspaces or other package workspaces.
_Avoid_: Application package

**Template recipe**:
Copy-once code owned by the scaffolded project after generation.
_Avoid_: Plugin, recipe package

**Template command**:
A local command that configures the scaffolded project or manages its workspaces.
_Avoid_: Generator

**Internal cleanup path**:
Maintainer-only content removed from a scaffolded project during setup.
_Avoid_: Generated file

**Backend alternative**:
An optional backend shape selected for a scaffolded project.
_Avoid_: Required backend, backend layer

**Preset**:
A reusable environment or tooling configuration selected by a local project generator.
_Avoid_: Template recipe

**Asset**:
A stored file represented by a stable identity so other domain records can refer to
it. An Asset has one Owner and records the Uploader who placed it in managed storage.

**Asset Owner**:
The User to whom an Asset belongs. Ownership can differ from creation provenance.

**Asset Uploader**:
The User who placed an Asset in managed storage. The Uploader does not necessarily
remain its Owner.
