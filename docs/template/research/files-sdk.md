# `files-sdk` research

Research date: 2026-07-26

Upstream examined: [`haydenbleasel/files-sdk`](https://github.com/haydenbleasel/files-sdk)

Pinned release: [`files-sdk@2.2.1`](https://github.com/haydenbleasel/files-sdk/releases/tag/files-sdk%402.2.1), commit [`cd011bc`](https://github.com/haydenbleasel/files-sdk/tree/cd011bc3f94ffa87ca1e4414657a56018419d5f0)

## Scope and method

This report uses only primary sources: upstream repository source, package metadata, tests, release records, CI workflows, and npm registry APIs. It does not examine the local storage package in this repository.

Linked primary sources directly support statements under **Verified**. Statements under **Inference** are adoption judgments from those facts, not upstream guarantees.

## Executive summary

### Verified

- `files-sdk` 2.2.1 is an ESM-only TypeScript package with one `Files` facade for 46 storage adapters. Its common operations are `upload`, `download`, `head`, `exists`, `delete`, `copy`, `move`, `list`, `listAll`, `search`, `url`, and `signedUploadUrl`. It also provides key-bound file handles, bulk overloads, plugins, a CLI, a browser/server gateway, framework bindings, and AI-tool integrations. The package publishes 82 export subpaths. ([package metadata](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json), [core source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts), [provider catalog](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts))
- The facade normalizes call and result shapes, but provider capabilities differ. Unsupported ranges, delimiters, metadata, cache control, resumable uploads, URL signing, upload constraints, and some copies fail. The facade does not silently emulate them. `files.capabilities` exposes eight feature indicators. Adapter documentation or testing is still required for provider-specific limitations. ([capability types and gates](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L637-L733), [provider gaps](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx))
- `UploadOptions` has no unified ACL option for each object. Core upload controls include content type, cache control, string metadata, progress, multipart or resumable control, cancellation, timeout, and retries. Some adapters set visibility when the code constructs an adapter. Examples include Vercel Blob `access` and UploadThing `acl`. Provider-native features remain available through `files.raw`. ([`UploadOptions`](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L226), [Vercel Blob options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/vercel-blob/index.ts#L28-L110), [UploadThing options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/uploadthing/index.ts#L23-L72), [`raw` getter](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1618-L1624))
- The project is young and changes quickly. The repository was created on 2026-05-08. It released `1.0.0` on 2026-05-09, `2.0.0` on 2026-06-21, and `2.2.1` on 2026-07-25. It made 16 stable releases in this period and had 416 commits at the pinned head. Most provider tests use mocks. Only filesystem and S3 have live suites, and a manual trigger runs live CI. ([repository metadata](https://api.github.com/repos/haydenbleasel/files-sdk), [releases](https://github.com/haydenbleasel/files-sdk/releases), [tests](https://github.com/haydenbleasel/files-sdk/tree/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test), [live-test workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/live-tests.yml))

### Inference

- It is a credible candidate when the goal is an application seam independent of a provider and the application can branch on capabilities.
- It is not a behaviorally compatible replacement for code that depends on ACLs for each upload, conditional or create-only writes, atomic rename, recursive listing, stable cross-version cursors, uniform signed-URL expiry, or uniform direct-upload limits.
- A migration must pin an exact version and run real integration tests against the selected provider. The large mocked suite is useful. However, the project age, release rate, adapter-specific behavior, and two live suites create meaningful provider-integration risk.

## Package architecture and exported API

### Verified architecture

The repository is a Bun/Turbo monorepo. The published package is in `packages/files-sdk`. The root README is a symlink to the package README. The package is ESM (`"type": "module"`) and marks itself side-effect free. It publishes JavaScript and declarations under `dist`, exposes a `files` CLI binary, and has no CommonJS export condition. ([root package](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/package.json), [`files-sdk` package](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json#L1-L32))

The 82 export subpaths are in these layers:

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

The code constructs the core object as `new Files({ adapter, ...defaults })`. Constructor controls include `prefix`, read-only mode, default `signal`/`timeout`/`retries`, observability hooks, optional mutation receipts, and an ordered plugin list. `createFiles` is equivalent to `new Files` at runtime, but adds plugin methods to the static type. ([constructor and options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L917-L969), [`createFiles`](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2728-L2782))

`Files` exposes:

- Properties: `raw`, `adapter`, normalized `prefix`, and `capabilities`.
- Lifecycle/scoping: `readonly()` and `file(key)`.
- Single and bulk overloads: `upload`, `download`, `head`, `exists`, and `delete`.
- Single operations: `copy`, `move`, `list`, `url`, and `signedUploadUrl`.
- Async iterators: `listAll` and `search`.
- Global helpers exported from the root: `transfer` and `sync` between `Files` instances.

Sources: [`Files` implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1255-L2726), [README](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md).

Each adapter satisfies a common `Adapter` contract and exposes its native client as `raw`. Capability flags cover range reads, upload progress, delimiters, metadata, cache control, resumable or multipart support, server-side copy, and signed download URL support. The adapter contract requires `copy`. Native `move`, native bulk delete, and resumable upload are optional. ([adapter contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L670-L825))

## Supported providers

### Verified

The source catalog contains 46 provider slugs. A test verifies that the catalog exactly matches storage subpath exports from the package. ([catalog](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L169-L173), [catalog consistency test](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/providers.test.ts#L80-L108))

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

The catalog also declares required non-environment configuration, credential modes, optional and required environment variables, aliases, the component that reads each variable (`files-sdk` or the native SDK credential chain), and optional peer packages for each adapter. ([provider types and data](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts))

## Operation behavior

### Upload

**Verified:** `upload(key, body, options?)` accepts `Blob`, `File`, `ReadableStream<Uint8Array>`, `ArrayBuffer`, array-buffer views, `Uint8Array`, or `string`. It returns `{ key, size, contentType, etag?, lastModified? }`. Content type first comes from an explicit option, then from a `Blob` or `File` type when available. Otherwise, it uses `application/octet-stream`. ([body and upload types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L71-L78), [`UploadOptions` and result](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L234))

The facade provides progress, but not with a uniform level of detail. Adapters without native reports provide byte progress for streams and start/end reports for buffered bodies. S3-family progress and multipart paths also require optional `@aws-sdk/lib-storage`. An S3 stream with unknown length automatically uses that path. ([progress implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1788-L1871), [S3 implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L132-L204))

`multipart` is advisory across adapters. S3-family, GCS/Firebase, Azure, OneDrive, and Dropbox have specific multipart or chunk paths. Other adapters can stream, buffer, chunk internally, or ignore it. Pause and resume use `UploadControl` and require a capability. Persistent resume cannot use a `ReadableStream` because the system cannot replay it. ([upload docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/upload.mdx), [resumable gate](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1873-L1914))

The bulk overload accepts content type, cache control, metadata, and multipart options for each item. It defaults to concurrency 8 and preserves input order among successes and errors. It resolves partial failures instead of throwing. It does not expose resumable `control` for each item. ([bulk types and implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L433-L486), [bulk upload](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1735-L1963))

### Download, head, and exists

**Verified:** `download` always resolves to a `StoredFile`. `{ as: "stream" }` changes its body source, not its top-level return type. `StoredFile` has `key`, `name`, `size`, `type`, optional `etag`/`lastModified`/`metadata`, and `arrayBuffer()`, `text()`, `blob()`, and `stream()` accessors. A stream-backed body has one use unless a buffering accessor first creates and caches it. ([download signature](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L1965-L2004), [`StoredFile` implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/stored-file.ts))

Byte ranges are inclusive (`start`, optional inclusive `end`). The facade validates them. It rejects a request before a provider call when the adapter does not advertise range support. HTTP-based adapters also verify that the server returned a partial response. They do not silently transfer the complete object. ([range type and gate](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L250-L294), [provider range matrix](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/download.mdx#L18-L56))

`head` fetches only metadata, but its body accessors lazily issue a complete download. `list` items behave the same way. `exists` returns `false` only for normalized `NotFound`. It throws for authorization, transport, and other failures. Bulk download, head, and exists collect failures for each key. They do not retry item operations. ([adapter contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L739-L761), [bulk implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2065-L2250))

### Delete

**Verified:** A single delete returns `void`. Missing-key behavior follows the provider. Idempotent providers resolve, while strict providers can throw `NotFound`. Bulk delete returns `{ deleted, errors? }`, defaults to concurrency 8 when emulated, and uses native bulk deletion when available. S3 divides native requests into groups of 1,000 keys. Plugins force a request for each key so they can intercept each delete. ([delete docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/delete.mdx), [facade implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2252-L2396), [S3 bulk implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L578-L645))

### List and search

**Verified:** `list({ prefix, cursor, limit, delimiter })` returns `{ items, prefixes?, cursor? }`. Documentation specifies a default page limit of 1,000, but providers can impose lower limits. A cursor applies to the same prefix and delimiter. `delimiter` support requires a capability. Some folder providers accept only `/`. ([list types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L296-L349), [delimiter matrix](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/list.mdx#L38-L65))

`listAll` walks cursors asynchronously and intentionally removes `delimiter`. Thus, it traverses objects, not folders. `search` runs on the client over paginated lists. It supports glob, regular expression, substring, and exact modes. When possible, it passes literal prefixes from a glob to provider listing. ([`listAll` and `search`](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2464-L2569))

Documentation lists important exceptions. Netlify Blobs has no cursor, so `listAll({ limit })` stops at one limited page. Box, OneDrive, and SharePoint lists are non-recursive and do not enter nested folders. ([list caveats](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/list.mdx#L21-L36))

### Download URLs

**Verified:** `url(key, { expiresIn?, responseContentDisposition? })` returns the most direct URL that an adapter can provide. Based on provider configuration, it returns an expiring signed or token URL, a permanent public or CDN URL, or an unsupported operation. The facade does not give each URL the same security contract. ([URL types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L519-L635), [URL docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/url.mdx))

- S3 and S3-compatible signing defaults to one hour unless configured otherwise; a configured `publicBaseUrl` normally returns a permanent URL instead.
- Vercel Blob public URLs are permanent and ignore `expiresIn`; private Vercel Blob has no URL primitive.
- Box, PocketBase, and Convex ignore the requested expiry because the provider fixes the lifetime or makes the URL permanent.
- Dropbox validates a maximum of four hours, but shorter requested expiries do not shorten the provider's approximately four-hour temporary link.
- OneDrive, SharePoint, Google Drive, Appwrite, Bunny, FTP/SFTP, bare R2 bindings, and Netlify each require public-mode configuration, hybrid signing credentials, or a fallback to `download()`, depending on adapter.

Source: [provider-gap register](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L8-L38).

`responseContentDisposition` forces attachment delivery for untrusted HTML or SVG. It forces signing when the provider supports signing. It throws when the provider cannot bind the override. It is not silently ignored. ([option contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L537-L561), [provider support](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L52-L54))

### Signed upload URLs

**Verified:** `signedUploadUrl(key, options)` returns a discriminated contract: either `{ method: "PUT", url, headers? }` or `{ method: "POST", url, fields }`. `expiresIn` is required. `contentType` can bind to the signature only when supported. `maxSize` and `minSize` use enforceable policy controls when available. Adapters fail closed when they cannot enforce a requested constraint. When a supporting POST policy uses `maxSize`, the default minimum is one byte unless `minSize: 0` is explicit. ([types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L564-L608), [S3 signing tests](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/s3.test.ts#L720-L799))

Vercel Blob, Bunny Storage, Appwrite, PocketBase, filesystem, and Convex do not expose this primitive through the adapter. A bare R2 binding also cannot sign. Azure, Supabase, R2, Google Drive, OneDrive, SharePoint, Cloudinary, and UploadThing cannot enforce `content-length-range` in this API. They reject unsupported size constraints. Azure also rejects signature-bound `contentType`. ([signed-upload docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/signed-upload-url.mdx))

The signed-upload contract has no unified metadata, cache-control, or ACL fields. It also transfers bytes outside `Files.upload()`. **Inference:** Review application behavior from upload plugins or upload hooks separately for direct uploads. Do not assume that it runs on a client-to-provider request.

### Copy and move

**Verified:** `copy` overwrites the destination and has no create-only guard. It runs only on the server when the adapter advertises that capability. Otherwise, bytes can stream or buffer through the process. Convex does not support copy. ([copy docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28instance-methods%29/copy.mdx), [provider copy gaps](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/%28concepts%29/provider-gaps.mdx#L39-L50))

`move` uses a native rename when the adapter provides one. Otherwise, it runs `copy` followed by `delete`. Therefore, object-store moves are not atomic. A failure between steps can leave both keys. A move to the same key has no effect. ([move implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2411-L2455))

## Runtime and framework constraints

### Verified

- The package is ESM-only. Upstream installation documents claim Node 18+ and Bun support, but `package.json` declares no `engines` field. CI builds and tests Node 20, 22, 24, and Bun, not Node 18. Therefore, documentation claims Node 18 support, but the current CI matrix does not represent it. ([installation docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/installation.mdx#L1-L13), [package metadata](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/package.json), [validation workflow](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/.github/workflows/validate.yml#L13-L90))
- The core API uses Web types (`Blob`, `File`, `ReadableStream`, `fetch`, `AbortSignal`, and Web Crypto where plugins require it). The core and `StoredFile` use the same interface across runtimes. Most provider adapters wrap server SDKs and are not safe for browsers. Browser code must use `files-sdk/client`, framework bindings that use the server gateway, or signed upload URLs created on the server. ([FAQ](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/faq.mdx#L26-L28), [gateway source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/api/index.ts))
- The build separately creates gateway/client entries and selected framework entries. This prevents Node shims from entering edge or browser bundles. Regression tests verify that gateway/client/Next/Hono output has no static `node:` imports. ([build script](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/scripts/build.ts#L38-L61), [bundle tests](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/build-output.test.ts#L149-L193))
- `files-sdk/client` and framework hooks support React Native/Expo descriptors. They compensate for React Native `fetch`, which does not stream. Downloads buffer, and the order of Blob accessors has a platform limitation. ([2.2.0 release notes](https://github.com/haydenbleasel/files-sdk/releases/tag/files-sdk%402.2.0), [React Native docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/ui/client/react-native.mdx))
- `fs` is for Node/Bun and upstream explicitly limits it to development and test. `bun-s3` is Bun-only. FTP and SFTP are Node-only because they use raw sockets. Memory is independent of runtime. WebDAV uses HTTP and documentation describes it as usable in Node and edge/browser runtimes. ([provider catalog entries](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L388-L443), [filesystem catalog entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L676-L685), [protocol catalog entries](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L687-L739))

Provider SDKs are optional peers. Adapter subpaths aim to keep unrelated providers out of bundles. Loading behavior differs. `files-sdk/s3` has static imports and fails at adapter import time when peers are absent. The public runtime loader lazily imports only the selected provider. R2 2.2.1 moved AWS SDK imports behind a dynamic boundary for Workers. ([S3 entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/index.ts), [README missing-peer behavior](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md#L7-L29), [2.2.1 notes](https://github.com/haydenbleasel/files-sdk/releases/tag/files-sdk%402.2.1), [lazy-loader bundle test](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/build-output.test.ts#L117-L146))

## Configuration and environment handling

### Verified

- Normal construction is explicit: import an adapter subpath, construct it with provider options, and pass it to `Files`. Provider constructors commonly use explicit options first and then environment variables. ([README quick start](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/README.md#L31-L46))
- `readEnv(key)` reads only `process.env` and returns `undefined` when `process` or `process.env` is absent. It does not load `.env` files or use Deno-specific environment APIs. In Workers or edge runtimes, pass values or bindings explicitly unless the runtime provides a compatible process shim. ([env helper](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/env.ts))
- Native SDK chains intentionally receive some credentials. Examples include the standard AWS credential chain and Google Application Default Credentials. The catalog distinguishes these from variables that `files-sdk` reads. ([catalog model](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L30-L97), [S3 catalog entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L1173-L1220), [GCS catalog entry](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L741-L773))
- `files-sdk/providers` is a data catalog with no provider dependency. It exposes `PROVIDERS`, `PROVIDER_NAMES`, `getProvider`, `listEnvVars`, and `getSecretEnvVars`. A source-level test verifies that the catalog represents each literal adapter `readEnv()` call. ([catalog API](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/providers/index.ts#L1597-L1636), [test](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/test/providers.test.ts#L110-L132))
- `files-sdk/loader` is for Node tools. It selects an explicit `provider` or `FILES_SDK_PROVIDER`, accepts flat provider and instance configuration in CLI style, supports extra adapter configuration through `configJson`, and lazily imports only the selected adapter. ([loader source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/loader/index.ts), [loader docs](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/providers.mdx#L91-L107))
- The optional browser gateway denies operations by default. Its upload-token HMAC secret comes from an explicit `secret`, then `FILES_API_SECRET`, then a random fallback for each process. The fallback is unsuitable for load-balanced instances. ([gateway options and secret resolution](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/api/index.ts#L28-L86))

## Metadata, content type, cache control, and ACL

### Verified

- `contentType` is a first-class upload option. The API returns it as `UploadResult.contentType` and `StoredFile.type`. It can infer the value from `Blob` or `File`. Otherwise, the common fallback is `application/octet-stream`. The optional `content-type` plugin can inspect bytes and correct or reject a claimed type. ([core upload type](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L155), [content-type plugin](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/content-type/index.ts))
- User metadata is `Record<string, string>`. Supported adapters return it from `head` and `list`. Unsupported adapters reject non-empty metadata before a provider call. Core documentation lists Vercel Blob, UploadThing, FTP, SFTP, Dropbox, Box, OneDrive, SharePoint, Cloudinary, Appwrite, PocketBase, Bunny Storage, Convex, and Bun S3 as adapters without this feature. Empty metadata is absent. ([metadata contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L169-L179), [runtime gate](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2036-L2063))
- Cache control is a separate string upload option. It fails closed when unsupported. `StoredFile` does not expose cache control, so a cross-provider `transfer` does not preserve it. ([cache-control contract](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L156-L167), [transfer limitation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/%28global-methods%29/transfer.mdx#L31))
- Core upload and signed-upload types have no ACL field. Visibility controls depend on provider configuration. Vercel Blob uses adapter-wide `access: "public" | "private"`. UploadThing uses adapter-wide `acl: "public-read" | "private"`. S3 adapter options do not expose a canned ACL. Use the native provider client through `raw` for features outside the common surface. ([core types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L149-L226), [S3 options](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L70-L119))

### Inference

- A migration that currently assigns ACL, storage class, encryption headers, retention or legal-hold settings, checksums, or conditional write preconditions for each upload requires adapter-specific calls, a custom adapter or plugin, or a changed storage policy. The common upload contract lacks these controls.
- Adapter-wide public or private settings intentionally give one `Files` instance an unambiguous role. Applications that mix public and private objects must use separate adapter instances or native provider operations.

## Error model, cancellation, timeout, and retry

### Verified

The facade normalizes all errors to `FilesError`, with:

- `code`: `NotFound`, `Unauthorized`, `Conflict`, `ReadOnly`, or `Provider`.
- `message`.
- the original `cause`.
- `aborted`, `timedOut`, and `permanent` flags.

HTTP and provider mappings generally turn 404 into `NotFound`, 401/403 into `Unauthorized`, 409/412 into `Conflict`, and all other values into `Provider`. Adapter mappers also inspect provider-specific codes. ([error source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/errors.ts), [S3 mapper](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/s3/core.ts#L405-L478))

Only `Provider` failures that are not aborted or permanent are retryable. Retries default to zero. The default backoff starts at 100 ms, doubles, has no jitter, and caps at 30 seconds. Stream uploads do not retry because the system cannot replay the body. Bulk item calls intentionally do not retry. ([retry source](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/retry.ts#L180-L225), [operation runner](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L2608-L2666))

Timeouts are per attempt, disabled by default, and set both `aborted` and `timedOut`. Timeout and caller cancellation are not retried. The source's `timedOut` and `permanent` flags are newer than the public errors page, which currently documents only `aborted`. ([timeout implementation](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/retry.ts#L17-L81), [errors page](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/apps/web/docs/api/errors.mdx))

Bulk overloads resolve partial failures in `errors[]` rather than rejecting. Construction/configuration errors and total operation failures can still reject. Provider `cause` can include request metadata and headers; upstream warns against forwarding it across trust boundaries without filtering. ([bulk error types](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/index.ts#L405-L516), [logging warning](https://github.com/haydenbleasel/files-sdk/blob/cd011bc3f94ffa87ca1e4414657a56018419d5f0/packages/files-sdk/src/internal/errors.ts#L29-L38))

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
