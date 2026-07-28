<div align="center">
  <h1 align="center"><code>@init/kv</code></h1>
</div>

Key-value storage built with [unstorage](https://unstorage.unjs.io/) and its Redis driver by default.

`kv()` lazily returns the shared unstorage `Storage` instance. `normalizeKey(...parts)` joins key parts with `:`, while `namespaceKey(namespace)` returns a key helper with that namespace prefix.

To use another backend, change the driver passed to `createStorage` in `src/client.ts`.

Values must be JSON-serializable; dates are returned as strings.
