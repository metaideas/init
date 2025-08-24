<div align="center">
  <h1 align="center"><code>mobile</code></h1>
</div>

Mobile application built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/).

## Known issues

NOTE: This package currently doesn't run out of the box, since Bun hoists the latest `tailwindcss` to the root level, and `nativewind` doesn't support it.

If you need to run this together with the other apps, you can do the following:

- Degrade the `tailwindcss` version to `3.4.17` in other apps, and adjust accordingly.
- Use a different package manager, like `pnpm`.
- Wait for `nativewind` to support `tailwindcss` v4.
  - See: https://github.com/nativewind/nativewind/discussions/1422
- Wait for Bun to support `nohoist` to allow multiple versions of the same package to be installed.
  - See: https://github.com/oven-sh/bun/issues/6850
- Use another styling solution for the mobile app.
  - Unistyles: https://github.com/jpudysz/react-native-unistyles

Hopefully we can find a fix for this soon.
