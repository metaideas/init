# `files-sdk` research

Research date: 2026-07-26

Upstream examined: [`haydenbleasel/files-sdk`](https://github.com/haydenbleasel/files-sdk)

Pinned release: [`files-sdk@2.2.1`](https://github.com/haydenbleasel/files-sdk/releases/tag/files-sdk%402.2.1), commit [`cd011bc`](https://github.com/haydenbleasel/files-sdk/tree/cd011bc3f94ffa87ca1e4414657a56018419d5f0)

## Scope and method

This report uses primary sources only: the upstream repository source, package metadata, tests, release records, CI workflows, and npm registry APIs. It does not inspect this repository's local storage package.

Statements under **Verified** are directly supported by linked primary sources. Statements under **Inference** are adoption judgments derived from those facts, not upstream guarantees.

## Executive summary

### Verified

- `files-sdk` 2.2.1 is an ESM-only TypeScript package providing one `Files` facade over 46 storage adapters. Its common operations are `upload`, `download`, `head`, `exists`, `delete`, `copy`, `move`, `list`, `listAll`, `search`, `url`, and `signedUploadUrl`, plus key-bound file handles, bulk overloads, plugins, a CLI, a browser/server gateway, framework bindings, and AI-tool integrations. The package publishes 82 export subpaths. ([package metadata](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json), [core source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts), [provider catalog](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts))
- The facade normalizes call and result shapes, but provider capabilities remain different. Unsupported ranges, delimiters, metadata, cache control, resumable uploads, URL signing, upload constraints, and some copies fail rather than being silently emulated. `files.capabilities` exposes eight feature indicators, but provider-specific caveats still require adapter documentation or testing. ([capability types and gates](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L637-L733), [provider gaps](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx))
- There is no unified per-object ACL option in `UploadOptions`. Core upload controls are content type, cache control, string metadata, progress, multipart/resumable control, cancellation, timeout, and retries. Some adapters instead set visibility at adapter construction, such as Vercel Blob's `access` and UploadThing's `acl`. Provider-native features remain available through `files.raw`. ([`UploadOptions`](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L226), [Vercel Blob options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/vercel-blob/index.ts#L28-L110), [UploadThing options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/uploadthing/index.ts#L23-L72), [`raw` getter](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1618-L1624))
- The project is young and changing quickly: the repository was created on 2026-05-08, `1.0.0` shipped on 2026-05-09, `2.0.0` on 2026-06-21, and `2.2.1` on 2026-07-25. It made 16 stable releases in that period and had 416 commits at the pinned head. Most provider tests are mocked; only filesystem and S3 have live suites, and live CI is manually triggered. ([repository metadata](https://api.github.com/repos/haydenbleasel/files-sdk), [releases](https://github.com/haydenbleasel/files-sdk/releases), [tests](https://github.com/haydenbleasel/files-sdk/tree/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test), [live-test workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/live-tests.yml))

### Inference

- It is a credible candidate when the goal is a provider-neutral application seam and the application can branch on capabilities.
- It is not a behaviorally drop-in abstraction for code that depends on per-upload ACLs, conditional/create-only writes, atomic rename, recursive listing, stable cross-version cursors, uniform signed-URL expiry, or uniform direct-upload limits.
- A migration should pin an exact version and run real integration tests against the selected provider. The large mocked suite is useful, but the project's age, release velocity, adapter-specific behavior, and only two live suites leave meaningful provider-integration risk.

## Package architecture and exported API

### Verified architecture

The repository is a Bun/Turbo monorepo. The published package lives at `packages/files-sdk`; the root README is a symlink to that package's README. The package is ESM (`"type": "module"`), marks itself side-effect free, publishes JavaScript plus declarations under `dist`, exposes a `files` CLI binary, and has no CommonJS export condition. ([root package](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/package.json), [`files-sdk` package](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json#L1-L32))

The 82 export subpaths fall into these layers:

| Layer              | Main exports                                                                                                                                                                             | Purpose                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Core               | `files-sdk`                                                                                                                                                                              | `Files`, `createFiles`, `FilesError`, `UploadControl`, adapter and operation types, `transfer`, `sync`, plugin helpers, provider names |
| Providers          | 46 `files-sdk/<provider>` paths                                                                                                                                                          | One adapter factory per provider/system backend                                                                                        |
| Provider discovery | `files-sdk/providers`, `files-sdk/loader`                                                                                                                                                | Zero-dependency provider/env catalog and lazy runtime provider selection                                                               |
| Gateway/client     | `files-sdk/api`, `files-sdk/client`                                                                                                                                                      | Framework-neutral Web `Request`/`Response` server gateway and browser client                                                           |
| Framework bindings | `react`, `vue`, `svelte`, `next`, `hono`, `express`, `fastify`, `koa`, `nestjs`, `nitro`, `astro`, `sveltekit`, `tanstack-start`                                                         | Client hooks/stores and thin server route adapters                                                                                     |
| Plugins            | `audit`, `cache`, `compression`, `content-type`, `dedup`, `encryption`, `validation`, `versioning`, `usage`, `tracing`, `signed-url-policy`, `soft-delete`, `tiering`, `failover`, `zip` | Operation wrappers and typed extensions                                                                                                |
| AI integrations    | `ai-sdk`, `openai`, `claude`                                                                                                                                                             | File tools for first-party AI SDK interfaces                                                                                           |

Sources: [export map](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json#L28-L356), [build layout](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/scripts/build.ts), [built-export regression tests](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/build-output.test.ts).

The core object is constructed as `new Files({ adapter, ...defaults })`. Constructor controls include `prefix`, read-only mode, default `signal`/`timeout`/`retries`, observability hooks, optional mutation receipts, and an ordered plugin list. `createFiles` is runtime-equivalent to `new Files` but carries plugin-added methods into the static type. ([constructor and options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L917-L969), [`createFiles`](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2728-L2782))

`Files` exposes:

- Properties: `raw`, `adapter`, normalized `prefix`, and `capabilities`.
- Lifecycle/scoping: `readonly()` and `file(key)`.
- Single and bulk overloads: `upload`, `download`, `head`, `exists`, and `delete`.
- Single operations: `copy`, `move`, `list`, `url`, and `signedUploadUrl`.
- Async iterators: `listAll` and `search`.
- Global helpers exported from the root: `transfer` and `sync` between `Files` instances.

Sources: [`Files` implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1255-L2726), [README](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md).

Every adapter satisfies a common `Adapter` contract and exposes its native client as `raw`. Capability flags cover range read, upload progress, delimiter, metadata, cache control, resumable/multipart support, server-side copy, and signed download URL support. `copy` is required on the adapter contract, while native `move`, native bulk delete, and resumable upload are optional. ([adapter contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L670-L825))

## Supported providers

### Verified

The source catalog contains 46 provider slugs, and a test asserts that the catalog exactly matches the package's storage subpath exports. ([catalog](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L169-L173), [catalog consistency test](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/providers.test.ts#L80-L108))

- Core object/blob platforms: AWS S3, Bun S3, Cloudflare R2, Google Cloud Storage, Firebase Storage, Azure Blob Storage, Vercel Blob, Netlify Blobs, Supabase Storage, Bunny Storage, UploadThing, Cloudinary, Appwrite, PocketBase, and Convex.
- Named S3-compatible adapters: Akamai, Alibaba OSS, Archil, Backblaze B2, DigitalOcean Spaces, Exoscale, Filebase, Hetzner, IBM COS, iDrive e2, MinIO, Neon, Oracle Cloud, OVHcloud, Scaleway, Storj, Tencent COS, Tigris, Vultr, Wasabi, and Yandex Object Storage.
- Consumer/document storage: Box, Dropbox, Google Drive, OneDrive, and SharePoint.
- System/protocol backends: filesystem, in-memory, FTP/FTPS, SFTP, and WebDAV.

Exact slugs:

```text
akamai, alibaba, appwrite, archil, azure, backblaze-b2, box, bun-s3,
bunny-storage, cloudinary, convex, digitalocean-spaces, dropbox, exoscale,
filebase, firebase-storage, fs, ftp, gcs, google-drive, hetzner, ibm-cos,
idrive-e2, memory, minio, neon, netlify-blobs, onedrive, oracle-cloud,
ovhcloud, pocketbase, r2, s3, scaleway, sftp, sharepoint, storj, supabase,
tencent, tigris, uploadthing, vercel-blob, vultr, wasabi, webdav, yandex
```

The catalog also declares each adapter's required non-env configuration, credential modes, optional/required environment variables, aliases, which component reads each variable (`files-sdk` or the native SDK credential chain), and optional peer packages. ([provider types and data](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts))

## Operation behavior

### Upload

**Verified:** `upload(key, body, options?)` accepts `Blob`, `File`, `ReadableStream<Uint8Array>`, `ArrayBuffer`, array-buffer views, `Uint8Array`, or `string`. It returns `{ key, size, contentType, etag?, lastModified? }`. Content type comes from an explicit option, then a `Blob`/`File` type where available, and otherwise falls back to `application/octet-stream`. ([body and upload types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L71-L78), [`UploadOptions` and result](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L234))

Progress is universal at the facade but not uniformly granular: adapters without native reporting get byte progress for streams and start/end reports for buffered bodies. S3-family progress and multipart paths additionally require optional `@aws-sdk/lib-storage`. Unknown-length S3 streams automatically take that path. ([progress implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1788-L1871), [S3 implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L132-L204))

`multipart` is advisory across adapters: S3-family, GCS/Firebase, Azure, OneDrive, and Dropbox have specific multipart/chunking paths; other adapters may stream, buffer, chunk internally, or ignore it. Pause/resume uses `UploadControl` and is capability-gated. A `ReadableStream` cannot be used for persistent resumability because it cannot be replayed. ([upload docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/upload.mdx), [resumable gate](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1873-L1914))

The bulk overload accepts per-item content type, cache control, metadata, and multipart options, defaults to concurrency 8, preserves input order among successes/errors, and resolves partial failures instead of throwing. It does not expose resumable `control` per item. ([bulk types and implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L433-L486), [bulk upload](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1735-L1963))

### Download, head, and exists

**Verified:** `download` always resolves to a `StoredFile`; `{ as: "stream" }` changes its body source, not its top-level return type. `StoredFile` has `key`, `name`, `size`, `type`, optional `etag`/`lastModified`/`metadata`, and `arrayBuffer()`, `text()`, `blob()`, and `stream()` accessors. A stream-backed body is single-consumption unless a buffering accessor materializes and caches it first. ([download signature](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1965-L2004), [`StoredFile` implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/stored-file.ts))

Byte ranges are inclusive (`start`, optional inclusive `end`). The facade validates them and rejects the request before the provider call when the adapter does not advertise range support. HTTP-based adapters also verify that the server actually returned a partial response rather than silently transferring the whole object. ([range type and gate](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L250-L294), [provider range matrix](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/download.mdx#L18-L56))

`head` fetches metadata only, but its returned body accessors lazily issue a full download. `list` items behave the same way. `exists` returns `false` only for normalized `NotFound`; auth, transport, and other failures throw. Bulk download/head/exists collect per-key failures and do not retry their item operations. ([adapter contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L739-L761), [bulk implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2065-L2250))

### Delete

**Verified:** single delete returns `void`. Missing-key behavior follows the provider: idempotent providers resolve, while strict providers may throw `NotFound`. Bulk delete returns `{ deleted, errors? }`, defaults to concurrency 8 when emulated, and uses native bulk deletion where supplied. S3 chunks native requests at 1,000 keys; plugins force per-key fan-out so each delete can be intercepted. ([delete docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/delete.mdx), [facade implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2252-L2396), [S3 bulk implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L578-L645))

### List and search

**Verified:** `list({ prefix, cursor, limit, delimiter })` returns `{ items, prefixes?, cursor? }`. The default page limit is documented as 1,000 but providers can impose lower limits. A cursor is scoped to the same prefix and delimiter. `delimiter` support is capability-gated; some folder providers accept only `/`. ([list types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L296-L349), [delimiter matrix](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/list.mdx#L38-L65))

`listAll` is an async cursor walker and deliberately strips `delimiter` so it traverses objects rather than folders. `search` is client-side over paginated listing, with glob, regex, substring, and exact modes; glob literal prefixes are pushed into provider listing where possible. ([`listAll` and `search`](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2464-L2569))

Important exceptions are documented: Netlify Blobs has no cursor, so `listAll({ limit })` stops at that one limited page; Box, OneDrive, and SharePoint listing is non-recursive and does not descend into nested folders. ([list caveats](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/list.mdx#L21-L36))

### Download URLs

**Verified:** `url(key, { expiresIn?, responseContentDisposition? })` returns the most direct URL an adapter can provide. Depending on provider/configuration, this is an expiring signed/token URL, a permanent public/CDN URL, or an unsupported operation. The facade does not turn every URL into the same security contract. ([URL types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L519-L635), [URL docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/url.mdx))

- S3 and S3-compatible signing defaults to one hour unless configured otherwise; a configured `publicBaseUrl` normally returns a permanent URL instead.
- Vercel Blob public URLs are permanent and ignore `expiresIn`; private Vercel Blob has no URL primitive.
- Box, PocketBase, and Convex ignore the requested expiry because the provider fixes the lifetime or makes the URL permanent.
- Dropbox validates a maximum of four hours, but shorter requested expiries do not shorten the provider's approximately four-hour temporary link.
- OneDrive, SharePoint, Google Drive, Appwrite, Bunny, FTP/SFTP, bare R2 bindings, and Netlify each require public-mode configuration, hybrid signing credentials, or a fallback to `download()`, depending on adapter.

Source: [provider-gap register](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L8-L38).

`responseContentDisposition` is intended to force attachment delivery for untrusted HTML/SVG. It forces signing where supported and throws where the provider cannot bind the override; it is not silently ignored. ([option contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L537-L561), [provider support](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L52-L54))

### Signed upload URLs

**Verified:** `signedUploadUrl(key, options)` returns a discriminated contract: either `{ method: "PUT", url, headers? }` or `{ method: "POST", url, fields }`. `expiresIn` is required. `contentType` can be signature-bound only where supported. `maxSize`/`minSize` use enforceable policy controls where available; adapters fail closed when they cannot enforce a requested constraint. When a supporting POST policy uses `maxSize`, the default minimum is one byte unless `minSize: 0` is explicit. ([types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L564-L608), [S3 signing tests](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/s3.test.ts#L720-L799))

Vercel Blob, Bunny Storage, Appwrite, PocketBase, filesystem, and Convex do not expose this primitive through the adapter; a bare R2 binding also cannot sign. Azure, Supabase, R2, Google Drive, OneDrive, SharePoint, Cloudinary, and UploadThing cannot enforce `content-length-range` in this API and reject unsupported size constraints. Azure additionally rejects signature-bound `contentType`. ([signed-upload docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/signed-upload-url.mdx))

The signed-upload contract has no unified metadata, cache-control, or ACL fields. It also transfers bytes outside `Files.upload()`. **Inference:** application behavior implemented as upload plugins or upload hooks must be reviewed separately for direct uploads rather than assumed to run on the client-to-provider request.

### Copy and move

**Verified:** `copy` overwrites the destination and has no create-only guard. It is server-side only where the adapter advertises that capability; otherwise bytes may stream or buffer through the process, and Convex copy is unsupported. ([copy docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/copy.mdx), [provider copy gaps](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L39-L50))

`move` uses a native rename for adapters that provide one and otherwise runs `copy` followed by `delete`. Object-store moves are therefore not atomic; a failure between steps can leave both keys. A same-key move is a no-op. ([move implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2411-L2455))

## Runtime and framework constraints

### Verified

- The package is ESM-only. Upstream installation docs claim Node 18+ and Bun, but `package.json` declares no `engines` field. CI builds and tests Node 20, 22, 24, and Bun, not Node 18. Node 18 support is therefore documented but not represented in the current CI matrix. ([installation docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/installation.mdx#L1-L13), [package metadata](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json), [validation workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/validate.yml#L13-L90))
- The core API is based on Web types (`Blob`, `File`, `ReadableStream`, `fetch`, `AbortSignal`, Web Crypto where plugins need it). The core and `StoredFile` are designed to be isomorphic, but most provider adapters wrap server SDKs and are not browser-safe. Browser usage is expected to go through `files-sdk/client` or framework bindings talking to the server gateway, or through server-minted signed upload URLs. ([FAQ](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/faq.mdx#L26-L28), [gateway source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/api/index.ts))
- Gateway/client entries and selected framework entries are built separately to prevent Node shims from leaking into edge/browser bundles. Regression tests assert that gateway/client/Next/Hono output has no static `node:` imports. ([build script](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/scripts/build.ts#L38-L61), [bundle tests](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/build-output.test.ts#L149-L193))
- `files-sdk/client` and framework hooks support React Native/Expo descriptors and compensate for React Native's non-streaming `fetch`, but downloads buffer and Blob accessor ordering has a platform caveat. ([2.2.0 release notes](https://github.com/haydenbleasel/files-sdk/releases/tag/files-sdk%402.2.0), [React Native docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/ui/client/react-native.mdx))
- `fs` is Node/Bun and explicitly described as development/test only; `bun-s3` is Bun-only; FTP and SFTP are Node-only because they use raw sockets; memory is runtime-neutral. WebDAV is HTTP-based and is described as usable in Node and edge/browser runtimes. ([provider catalog entries](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L388-L443), [filesystem catalog entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L676-L685), [protocol catalog entries](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L687-L739))

Provider SDKs are optional peers and adapter subpaths are intended to keep unrelated providers out of bundles. Actual loading behavior varies: `files-sdk/s3` has static imports and fails at adapter import time if its peers are absent, while the public runtime loader lazily imports only the chosen provider, and R2 2.2.1 specifically moved AWS SDK imports behind a dynamic boundary for Workers. ([S3 entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/index.ts), [README missing-peer behavior](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md#L7-L29), [2.2.1 notes](https://github.com/haydenbleasel/files-sdk/releases/tag/files-sdk%402.2.1), [lazy-loader bundle test](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/build-output.test.ts#L117-L146))

## Configuration and environment handling

### Verified

- Normal construction is explicit: import an adapter subpath, construct it with provider options, and pass it to `Files`. Provider constructors commonly prefer explicit options and fall back to environment variables. ([README quick start](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md#L31-L46))
- `readEnv(key)` only reads `process.env` and safely returns `undefined` when `process` or `process.env` is absent. It does not load `.env` files and does not consult Deno-specific env APIs. In Workers/edge runtimes, pass values or bindings explicitly unless the runtime provides a compatible process shim. ([env helper](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/env.ts))
- Some credentials are deliberately delegated to native SDK chains, such as AWS's standard credential chain and Google's Application Default Credentials. The catalog distinguishes those from variables that `files-sdk` reads itself. ([catalog model](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L30-L97), [S3 catalog entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L1173-L1220), [GCS catalog entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L741-L773))
- `files-sdk/providers` is a zero-provider-dependency data catalog exposing `PROVIDERS`, `PROVIDER_NAMES`, `getProvider`, `listEnvVars`, and `getSecretEnvVars`. A source-level test checks every literal adapter `readEnv()` call is represented in the catalog. ([catalog API](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L1597-L1636), [test](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/providers.test.ts#L110-L132))
- `files-sdk/loader` is positioned for Node tools. It selects from an explicit `provider` or `FILES_SDK_PROVIDER`, accepts flat CLI-style provider/instance configuration, supports extra adapter configuration through `configJson`, and lazily imports only the selected adapter. ([loader source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/loader/index.ts), [loader docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/providers.mdx#L91-L107))
- The optional browser gateway is deny-by-default for operations. Its upload-token HMAC secret comes from an explicit `secret`, then `FILES_API_SECRET`, then a per-process random fallback that is unsuitable across load-balanced instances. ([gateway options and secret resolution](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/api/index.ts#L28-L86))

## Metadata, content type, cache control, and ACL

### Verified

- `contentType` is a first-class upload option and is returned as `UploadResult.contentType` and `StoredFile.type`. It may be inferred from `Blob`/`File`; otherwise the common fallback is `application/octet-stream`. The optional `content-type` plugin can inspect bytes and correct or reject a claimed type. ([core upload type](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L155), [content-type plugin](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/content-type/index.ts))
- User metadata is `Record<string, string>`. On supported adapters it is returned by `head` and `list`; unsupported adapters reject non-empty metadata before making a provider call. The core documentation names Vercel Blob, UploadThing, FTP, SFTP, Dropbox, Box, OneDrive, SharePoint, Cloudinary, Appwrite, PocketBase, Bunny Storage, Convex, and Bun S3 as lacking this primitive. Empty metadata is treated as absent. ([metadata contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L169-L179), [runtime gate](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2036-L2063))
- Cache control is a separate string upload option and is also fail-closed when unsupported. `StoredFile` does not expose cache control, so cross-provider `transfer` does not preserve it. ([cache-control contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L156-L167), [transfer limitation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28global-methods%29/transfer.mdx#L31))
- There is no ACL field in the core upload or signed-upload types. Visibility controls are provider/configuration-specific. Vercel Blob uses adapter-wide `access: "public" | "private"`; UploadThing uses adapter-wide `acl: "public-read" | "private"`. S3's adapter options do not expose a canned ACL. Use the provider's native client via `raw` for features outside the common surface. ([core types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L226), [S3 options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L70-L119))

### Inference

- A migration that currently assigns ACL, storage class, encryption headers, retention/legal-hold settings, checksums, or conditional write preconditions per upload will need adapter-specific calls, a custom adapter/plugin, or a changed storage policy. These controls are absent from the common upload contract.
- Because adapter-wide public/private settings intentionally make one `Files` instance unambiguous, applications mixing public and private objects should expect separate adapter instances or native-provider operations.

## Error model, cancellation, timeout, and retry

### Verified

All facade errors are normalized to `FilesError`, with:

- `code`: `NotFound`, `Unauthorized`, `Conflict`, `ReadOnly`, or `Provider`.
- `message`.
- original `cause`.
- `aborted`, `timedOut`, and `permanent` flags.

HTTP/provider mappings generally turn 404 into `NotFound`, 401/403 into `Unauthorized`, 409/412 into `Conflict`, and everything else into `Provider`. Adapter mappers also inspect provider-specific codes. ([error source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/errors.ts), [S3 mapper](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L405-L478))

Only `Provider` failures that are neither aborted nor marked permanent are retryable. Retries default to zero. The default backoff starts at 100 ms, doubles, has no jitter, and caps at 30 seconds. Stream uploads are not retried because the body cannot be replayed; bulk item calls are intentionally retry-free. ([retry source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/retry.ts#L180-L225), [operation runner](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2608-L2666))

Timeouts are per attempt, disabled by default, and set both `aborted` and `timedOut`. Timeout and caller cancellation are not retried. The source's `timedOut` and `permanent` flags are newer than the public errors page, which currently documents only `aborted`. ([timeout implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/retry.ts#L17-L81), [errors page](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/errors.mdx))

Bulk overloads resolve partial failures in `errors[]` rather than rejecting. Construction/configuration errors and total operation failures can still reject. Provider `cause` may include request metadata and headers; upstream warns against forwarding it across trust boundaries without filtering. ([bulk error types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L405-L516), [logging warning](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/errors.ts#L29-L38))

## Tests, maturity, versioning, and release cadence

### Verified

- Pinned package version: 2.2.1. The npm package metadata identifies the same Git commit, publishes 669 files with an unpacked size of about 4.7 MB, and includes npm provenance attestations. ([npm registry metadata](https://registry.npmjs.org/files-sdk/2.2.1))
- Repository history at the pinned head: 416 commits, 18 listed contributors, 1,477 stars, 43 forks, and no open issues at research time. These are activity/popularity measures, not correctness guarantees. ([repository API](https://api.github.com/repos/haydenbleasel/files-sdk), [contributors API](https://api.github.com/repos/haydenbleasel/files-sdk/contributors?per_page=100), [commit API pagination](https://api.github.com/repos/haydenbleasel/files-sdk/commits?per_page=1))
- npm reported 194,266 downloads from 2026-06-25 through 2026-07-24. Downloads do not identify production use or unique adopters. ([npm downloads API](https://api.npmjs.org/downloads/point/2026-06-25:2026-07-24/files-sdk))
- The package test directory contains 121 TypeScript files, including 118 `*.test.ts` suites and two `*.live.test.ts` suites. Most tests mock providers; real-backend coverage is filesystem and S3 only. Live tests require `LIVE_TESTS=1`; CI runs them only through manual `workflow_dispatch`, and credential-dependent suites skip without env vars. ([test tree](https://github.com/haydenbleasel/files-sdk/tree/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test), [README live-test policy](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md#L98-L111), [workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/live-tests.yml))
- The package's coverage configuration declares 98% line and function thresholds, but the normal validation and release workflows execute `bun test`, not `bun test --coverage`; the threshold is therefore a configured coverage-run requirement, not evidence that every CI run measures 98%. ([Bun test config](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/bunfig.toml), [validation workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/validate.yml), [release workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/release.yml))
- Validation builds and tests across Node 20/22/24 and Bun, and separately runs lint/format, type checks, and a docs-site build. The release workflow reruns tests and the SDK build before Changesets publishes to npm. The 2.2.1 release workflow completed successfully. ([validation workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/validate.yml), [release workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/release.yml), [successful release run](https://github.com/haydenbleasel/files-sdk/actions/runs/30170052636))

Release record:

| Version             | Published                |
| ------------------- | ------------------------ |
| 1.0.0               | 2026-05-09               |
| 1.1.0, 1.1.1, 1.1.2 | 2026-05-09 to 2026-05-10 |
| 1.2.0 through 1.7.0 | 2026-05-10 to 2026-05-31 |
| 1.8.0, 1.9.0        | 2026-06-07, 2026-06-14   |
| 2.0.0               | 2026-06-21               |
| 2.1.0               | 2026-07-06               |
| 2.2.0               | 2026-07-19               |
| 2.2.1               | 2026-07-25               |

Source: [GitHub releases](https://github.com/haydenbleasel/files-sdk/releases).

The release process uses Changesets and publishes on merged changes through a release PR/action rather than a declared calendar. ([Changesets config](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.changeset/config.json), [release workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/release.yml))

### Inference

- The number and breadth of tests, package-output regression tests, normalized error tests, security-focused fixes, and multi-runtime CI show substantial engineering investment.
- The project is nevertheless early-stage by calendar age. Sixteen releases, a major version within six weeks of 1.0, and long patch sections correcting data integrity, security, cursor, timeout, and bundling behavior indicate active hardening rather than a settled API/behavior baseline.
- The low open-issue count cannot establish low defect incidence because the repository is young and changes rapidly.

## License

### Verified

The package and repository are MIT licensed, copyright 2026 Hayden Bleasel. The root monorepo package's `ISC` metadata does not override the published `files-sdk` package's explicit MIT metadata and repository `LICENSE`. ([license text](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/LICENSE), [published package metadata](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json#L1-L15))

## Migration-relevant limitations and checks

### Verified limitations

1. **Capability parity is intentionally incomplete.** Call shapes are stable, but ranges, folders, metadata, cache control, resumability, signing, size constraints, and copy cost vary. Check `files.capabilities` and the chosen adapter's source/docs.
2. **ACL is not portable.** There is no common per-upload ACL, and signed upload contracts do not carry ACL or metadata. Some adapters fix public/private behavior at construction.
3. **Writes are generally overwrite-oriented.** `copy` and `move` explicitly overwrite destinations, and there is no common create-only/conditional-write option in the core API.
4. **Moves are usually non-atomic.** Object stores use copy then delete. Recovery can leave both keys temporarily or permanently after an intermediate failure.
5. **Copy cost is provider-dependent.** `capabilities.serverSideCopy` must be checked before assuming large objects stay inside the provider. Some fallbacks stream; some, notably UploadThing, buffer the entire object. ([UploadThing source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/uploadthing/index.ts#L167-L198), [provider gaps](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L39-L50))
6. **Listing is not uniformly recursive or pageable.** Netlify's cursor gap and document-provider shallow listings can make a nominal `listAll` incomplete for migration scans.
7. **Cursors are provider/version artifacts.** The changelog explicitly records cursor shape changes for Supabase and tiering and warns not to persist them across versions. ([1.9.0 changelog](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/CHANGELOG.md#L129-L131))
8. **Signed URL semantics are not uniform.** Some expiries are ignored or provider-fixed, some configurations return permanent public URLs, and some providers cannot produce a URL. `responseContentDisposition` support also varies.
9. **Signed upload safety is provider-dependent.** Not every adapter can bind content type or size. A request for an unenforceable limit throws, while omitting `maxSize` can produce an unbounded PUT capability until expiry.
10. **Bulk calls differ from single calls.** Partial errors are returned rather than thrown, bulk items do not retry, and plugin installation can turn native batch delete into per-key calls.
11. **Stream access is one-shot.** A stream-backed `StoredFile.stream()` cannot subsequently be re-read through another accessor unless the body was buffered first.
12. **Environment access is `process.env`-centric.** Explicit configuration is required in runtimes without it; native SDK chains have their own runtime restrictions.
13. **Optional peers can fail at import/build time.** Static adapter entries such as S3 require their peers when imported. The lazy loader and R2's binding/fetch paths mitigate this only for those paths.
14. **The local filesystem and memory adapters are not production persistence substitutes.** Upstream labels filesystem dev/test only and memory non-persistent.
15. **Provider conformance is primarily mock-tested.** Only S3 and filesystem currently have live suites in the repository.

### Verified documentation/source mismatches

- Installation docs say provider peers are "loaded lazily on first use," but `files-sdk/s3` statically imports its peers and the README says importing an adapter without its peer throws `ERR_MODULE_NOT_FOUND`. Treat loading behavior as adapter-specific. ([installation statement](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/installation.mdx#L14-L30), [S3 source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/index.ts))
- Installation docs say the package has one runtime dependency, but package metadata lists four regular dependencies: `aws4fetch`, `commander`, `picomatch`, and `safe-regex2`. Tree shaking and subpath usage can reduce what reaches a consumer bundle, but the metadata claim is not literally current. ([installation statement](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/installation.mdx#L6), [dependencies](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json#L366-L371))
- The generic download page visually labels `{ as: "stream" }` as returning a `ReadableStream`, while the public TypeScript overload and implementation always return `StoredFile`; the option selects a streaming body source accessed through `StoredFile.stream()`. Follow the type/source. ([docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/download.mdx#L6-L16), [source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1965-L2004))
- The generic copy page says read/write fallbacks stream rather than buffer and names UploadThing as an example, while the provider-gap register and UploadThing source say UploadThing buffers the complete object because its API requires a `Blob`. Follow the adapter source/provider-specific caveat. ([generic copy docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/copy.mdx#L16-L23), [UploadThing implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/uploadthing/index.ts#L167-L198))
- Public error docs omit the source-level `timedOut` and `permanent` properties. Follow `FilesError` declarations for control flow. ([docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/errors.mdx#L22-L37), [source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/errors.ts))

### Recommended migration validation (inference)

Before adopting, build a provider-specific contract test for:

1. Overwrite and missing-delete behavior.
2. Metadata/content-type/cache-control round trips.
3. Full recursive listing, pagination, delimiter behavior, and key ordering on production-shaped data.
4. Large upload/download streaming and memory use.
5. Range reads and timeout/cancellation behavior.
6. Signed download expiry and forced attachment behavior.
7. Signed upload enforcement for content type and byte limits.
8. Copy/move behavior, metadata preservation, atomicity expectations, and egress cost.
9. Error classification for auth, missing objects, throttling, provider 5xx, timeout, and caller abort.
10. Runtime/bundler compatibility with only the selected optional peers installed.

Pin `files-sdk` exactly during evaluation, do not persist provider cursors across package upgrades, and use `files.raw` only behind a narrow application-owned adapter so provider-specific behavior does not spread through call sites.
