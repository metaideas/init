# init

init is a TypeScript monorepo template. Developers select the application workspaces
and package workspaces for their product.

## Language

**Template**:
The template is the upstream `metaideas/init` repository before developers install it.
It includes the product scaffold and material that only maintainers use.
_Avoid_: Starter, boilerplate

**Scaffolded project**:
Developers create and configure a scaffolded project from the template. A scaffolded
project is a separately owned repository.
_Avoid_: Template instance, downstream template

**Workspace**:
A workspace is a selectable application workspace or a reusable package workspace that
a scaffolded project includes.
_Avoid_: Module, project

**Application workspace**:
An application workspace is a product surface that users see or that can run
independently.
_Avoid_: App package

**Package workspace**:
A package workspace provides runtime code that application workspaces or other package
workspaces share.
_Avoid_: Application package

**Template recipe**:
A template recipe is copy-once code that a scaffolded project owns after generation.
_Avoid_: Plugin, recipe package

**Template command**:
A template command is a local command that configures a scaffolded project or manages
its workspaces.
_Avoid_: Generator

**Internal cleanup path**:
An internal cleanup path is content that only maintainers use. Setup removes it from a
scaffolded project.
_Avoid_: Generated file

**Backend alternative**:
A backend alternative is an optional backend shape that a scaffolded project selects.
_Avoid_: Required backend, backend layer

**Preset**:
A preset is a reusable configuration for an environment or tooling that a local
project generator selects.
_Avoid_: Template recipe

**Asset**:
An Asset is a file in storage with a stable identity. Other domain records can refer to
it. An Asset has one Owner and records the Uploader who puts it in managed storage.

**Asset Owner**:
An Asset Owner is the User to whom an Asset belongs. Ownership can differ from the
provenance of its creation.

**Asset Uploader**:
An Asset Uploader is the User who puts an Asset in managed storage. The Uploader is
not always its Owner.
