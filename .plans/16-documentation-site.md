# Plan 16 — Init documentation site

**Status:** Pending
**Size:** L

Turn `apps/docs` into the public Init documentation site and the polished,
replaceable Starlight example that ships when a scaffold owner selects the docs
workspace. Present the consumer-facing material already authored under root `docs/`
instead of maintaining a second copy inside the application workspace, and bring the
visual system into the same family as `apps/web`.

The result should preserve Starlight's documentation strengths—accessible navigation,
search, table of contents, code presentation, localization, and static output—while
adopting Init's typography, neutral palette, sky accent, wordmark, and restrained visual
character. It should feel related to the marketing site without turning documentation
pages into another landing page.

## Decision

Use one documentation-site workspace with two roles:

- In the template repository, it presents Init's own consumer documentation.
- In a scaffolded project, it is a complete documentation-site example that renders
  the scaffold owner's inherited and subsequently authored root documentation.
- Root `docs/` owns authored Markdown and MDX content.
- `apps/docs` owns the presentation module: content loading, routes, navigation,
  search, metadata, localization behavior, styles, and static assets.
- Do not copy root documents into `apps/docs/src/content/docs`, create a second docs
  tree, or import runtime code from `apps/web`.

Record this upstream choice in
`docs/template/adr/0006-docs-dual-role.md`, following the decision routing in
`docs/agents/domain.md`. The ADR must distinguish the template maintainer's choice from
decisions made later by a scaffold owner.

## Content seam

The content collection is the seam between authored repository documentation and the
Starlight presentation module. Keep its interface small:

- publish supported Markdown and MDX files from root `docs/`;
- derive stable routes from paths relative to `docs/`;
- validate page metadata through Starlight's `docsSchema()`;
- explicitly include consumer-facing content and exclude maintainer-only material.

Implement the adapter in `apps/docs/src/content.config.ts` with Astro's `glob()` loader
instead of Starlight's fixed `docsLoader()`, whose implementation only reads
`src/content/docs`. Set the loader base to root `docs/` and use inclusion patterns that
publish:

| Source                          | Route               | Navigation           |
| ------------------------------- | ------------------- | -------------------- |
| `docs/index.mdx`                | `/`                 | Overview             |
| `docs/getting-started.md`       | `/getting-started/` | Start Here           |
| Other top-level consumer guides | `/<filename>/`      | Guides               |
| `docs/architecture/**`          | `/architecture/**`  | Architecture         |
| `docs/es/**`                    | `/es/**`            | Spanish localization |

Do not publish or index:

- `docs/agents/**`, which configures repository agents and issue workflows;
- `docs/template/**`, which contains upstream governance and research and is removed
  through the internal cleanup path during setup;
- a future `docs/adr/**` by default, because application-owner decisions should not
  become public documentation without an explicit publishing choice.

This inclusion policy must be visible in one loader configuration rather than repeated
through per-page flags. A content change should become visible after editing its root
document and rebuilding the docs workspace; no synchronization command should exist.

## 1. Move the example homepage into canonical documentation

Create `docs/index.mdx` as the Starlight splash homepage and remove the placeholder
homepage under `apps/docs/src/content/docs/index.mdx`.

The homepage should include:

- the Init wordmark and concise documentation-specific introduction;
- the scaffold command `bun create metaideas/init my-app`;
- a primary action to Getting Started and a secondary GitHub action;
- cards leading to setup, workspace selection, project generators, and architecture;
- a compact statement that Init is a selectable TypeScript monorepo template, using
  the vocabulary in `CONTEXT.md`;
- no marketing marquee, oversized animated headline, or duplicated marketing footer.

Use Starlight's native hero, card, and code facilities where they satisfy the design.
Add a local Astro module only when it hides meaningful reusable behavior rather than
wrapping one Starlight element.

Move or recreate the Spanish homepage as `docs/es/index.mdx`. Keep English as the
canonical authoring language for the existing guides. Starlight should show its normal
fallback notice for untranslated content; translating every guide is not required by
this plan.

Delete `apps/docs/src/shared/components/localized-greeting.astro` and remove the
`docs_example_greeting` catalog messages once nothing uses them.

## 2. Make existing Markdown valid Starlight content

Add minimal frontmatter to each published root document:

- `title`;
- a useful `description` suitable for search and metadata;
- `sidebar.order` or `sidebar.label` only where route order or display text is not
  obvious;
- page-specific table-of-contents or edit-link overrides only when necessary.

Keep documents useful when read directly on GitHub. Do not replace meaningful H1s with
site-only presentation or introduce MDX imports into ordinary guides unless the result
materially improves comprehension.

Review internal relative links after the content base changes. Links must work both in
GitHub source views and in generated Starlight routes. Prefer normal relative Markdown
links and let Astro resolve them; do not hard-code the production docs hostname into
cross-document links.

## 3. Establish the information architecture

Replace the one-page sidebar in `apps/docs/astro.config.ts` with a deliberate manual
top-level structure:

1. **Start Here**
   - Overview
   - Getting Started
   - Development
2. **Build**
   - Project Generators
   - Package Guidance
   - Internationalization
   - Template Commands
3. **Architecture**
   - Project Structure
   - Backend Topology
   - File Service
   - Desktop Behavior
4. **Elsewhere**
   - `init.now`
   - GitHub

The manual groups define the reader journey and stable labels. Autogeneration may be
used inside a group only if it preserves this order and does not expose excluded
directories. Keep route slugs aligned with source paths so edit links and repository
navigation remain predictable.

Configure Starlight search over every published page. Verify that excluded agent,
template, research, and ADR content cannot appear in Pagefind results.

## 4. Bring the visual system closer to `apps/web`

Expand `apps/docs/src/shared/styles/globals.css` through Starlight's supported custom CSS
and design tokens. Preserve Starlight's layout and accessible interaction behavior.

Adopt the marketing site's visual language:

- light background near `#fafafa` and dark background `#080a0d`;
- neutral navigation and panel surfaces with quiet hairlines;
- sky as the signal/accent color;
- the same muted-text hierarchy and restrained shadows;
- Geist Mono for the wordmark, code, and small technical labels;
- compatible radii, focus rings, and light/dark contrast;
- subtle radial glow or grid detail on the splash homepage and header, not behind long
  reading surfaces;
- Init favicon, logo, and social-preview artwork sized for documentation use.

Style the Starlight primitives that readers encounter most:

- site title and header;
- search trigger and modal;
- sidebar links and current-page state;
- headings, inline code, and expressive code blocks;
- cards, asides, and link buttons;
- table of contents and previous/next navigation;
- locale and theme controls.

Prefer Starlight configuration and CSS variables before overriding a Starlight module.
If the built-in title configuration cannot produce the desired `init / docs` wordmark,
add one local `SiteTitle.astro` override while continuing to use the default header,
search, theme, and language modules.

Do not import from `apps/web`; app-to-app imports are forbidden. Keep the small docs
assets locally owned. Do not introduce a brand package in this plan unless a third
independent caller creates a real seam for shared branding.

Honor reduced motion, preserve visible keyboard focus, maintain readable contrast in
both themes, and keep touch targets usable on narrow screens.

## 5. Complete public-site metadata and behavior

Configure a canonical `site` URL so Starlight's sitemap is generated without the
current warning. Use the intended Init docs hostname as the production default and
allow scaffold owners to replace it through the same environment-tooling conventions
used by `apps/web`.

Add or configure:

- site title and description;
- canonical URLs;
- Init favicon;
- Open Graph and social-preview metadata;
- theme color for light and dark modes;
- GitHub social link;
- edit links targeting the canonical source files under root `docs/`;
- last-updated information when Git history is available;
- a useful static 404 page consistent with the docs theme.

The production build must require no external service or account. Pagefind remains the
local static search adapter; do not add hosted search in this plan.

## 6. Connect the web and docs surfaces

Add a clear documentation link from `apps/web` and a return link from the docs site to
`init.now`. Keep the two application workspaces independently buildable and do not
share imports between them.

Centralize site name, GitHub URL, marketing URL, and documentation URL inside the
appropriate workspace's shared constants so metadata and navigation within that
workspace cannot drift across multiple call sites. Duplicating a few deployment URLs
across independently selectable application workspaces is preferable to creating a
shallow shared package for constants with only two callers.

Preserve the user's existing uncommitted work in `apps/web`, especially changes under
the landing hero and ship-target modules. The docs link should be a narrow integration
change that does not rewrite those files unnecessarily.

## 7. Document customization and scaffold behavior

Expand `apps/docs/README.md` with:

- root development and targeted build commands;
- the root `docs/` → Starlight content ownership model;
- the published/excluded directory policy;
- where to change the wordmark, colors, site URL, navigation, and metadata;
- how to add a page or localized page;
- the lack of external build-time and runtime services.

Update the root README to link to the deployed documentation site while retaining
useful source links where appropriate.

Verify the template's two selection outcomes in disposable scaffolds:

- keeping the docs workspace retains the complete site and renders the scaffolded
  project's root documentation;
- omitting the docs workspace removes `apps/docs` while leaving the root Markdown
  documentation available to the scaffold owner;
- removal of `docs/template/`, issue-tracker instructions, and other internal cleanup
  paths leaves no dangling routes, imports, or links in the built site.

Do not add `docs/` itself to cleanup paths and do not make the documentation site
load-bearing for reading repository guidance.

## Verification

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
bun run build --filter=docs
bun run build --filter=web
```

Run the targeted builds after content and navigation changes rather than waiting until
the end. Run `bun run analyze` after changing dependencies, imports, or exports.

Manual verification:

- Check the splash page and representative long-form pages at narrow mobile, tablet,
  laptop, and wide desktop widths.
- Verify keyboard navigation, skip link, visible focus, search, copy buttons, and
  previous/next navigation.
- Verify light, dark, system, and reduced-motion behavior.
- Search for terms from every consumer-facing guide and confirm excluded maintainer
  documents never appear.
- Verify English and Spanish routes, locale switching, and fallback notices.
- Verify source-relative links, heading anchors, edit links, and last-updated metadata.
- Inspect the built title, description, canonical URL, favicon, sitemap, Open Graph
  image, and 404 page.
- Run `bun template setup` in disposable scaffolds with `docs` retained and omitted.

## Acceptance criteria

- Root `docs/` is the only authored documentation source; existing guides are not
  copied under `apps/docs`.
- The docs workspace publishes all consumer-facing top-level and architecture
  documents with stable routes, coherent navigation, and Pagefind search.
- `docs/agents/**`, `docs/template/**`, and project ADRs are absent from public routes
  and search unless a future explicit decision changes the inclusion policy.
- The site visibly belongs to the same design family as `apps/web` while preserving a
  calm, readable documentation surface.
- The homepage provides direct paths into setup, building, and architecture and uses
  the project's established vocabulary.
- Theme, locale, search, keyboard, responsive, and reduced-motion behavior remain
  accessible.
- Canonical, sitemap, favicon, social, edit-link, and 404 metadata are complete.
- `bun run build --filter=docs` completes without the missing-`site` sitemap warning
  and without external services.
- `apps/docs` remains independently selectable, buildable, replaceable, and removable
  through normal template setup.
- Keeping or omitting the workspace in a disposable scaffold produces no dangling
  content, imports, cleanup-path references, or dependency-graph errors.

## Out of scope

- Translating every existing guide into Spanish.
- Publishing template ADRs, research, agent instructions, or project ADRs.
- Hosted search, analytics, authentication, comments, or a documentation backend.
- Rebuilding Starlight's layout, search, theme, or locale modules from scratch.
- A shared brand package created solely for `apps/web` and `apps/docs`.
- A second documentation source tree, content synchronization command, or independent
  lockfile.
- Broad rewrites of the existing technical documentation unrelated to presentation,
  metadata, navigation, or broken links discovered during migration.

## Decisions

- Source content: root `docs/`
- Presentation workspace: `apps/docs`
- Framework: Astro Starlight with static output and local Pagefind search
- Content adapter: Astro `glob()` loader validated by Starlight `docsSchema()`
- Published content: consumer guides, architecture, and localized public pages
- Excluded content: agent instructions, template governance/research, and project ADRs
- Visual reference: the existing `apps/web` palette, typography, assets, and interaction
  character
- Localization: English canonical content with a Spanish homepage and Starlight
  fallbacks until guides are translated
- Scaffold behavior: retain the complete example when `docs` is selected; leave root
  Markdown intact when it is omitted
