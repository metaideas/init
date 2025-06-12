# `mobile`

Note: This package currently uses a patched version of `nativewind` to allow us to run multiple versions of `tailwindcss` in the same monorepo.

This eventually can be removed if:

- Bun supports `nohoist` to allow multiple versions of the same package to be installed.
- Nativewind supports `tailwindcss` v4.