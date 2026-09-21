# `@init/native-ui` component inventory

This file records the source, the disposition, and the verification status of each public
component in `@init/native-ui`. Update it when you add, change, or remove a component.

## Upstream reference

- Source: [founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables),
  Uniwind registry (`packages/registry/src/uniwind/components/ui`).
- Pinned commit: `119d0b101ff0d18408dc392120e12b5c78ae0c05` (2026-07-02).
- Last comparison: 2026-09-21, against upstream `a477f2c9e78956675f228d403b99d7da56b79e68`. The
  registry had no changes after the pinned commit. The registry contains 31 components and
  `native-only-animated-view`. All of them are in this package.
- License: MIT. The upstream notice is in
  [`LICENSE-react-native-reusables`](./LICENSE-react-native-reusables).

The files are copy-owned source. Upstream is a reference, not a dependency. The upstream review
process is in [Package Guidance](../../docs/packages.md#native-ui).

## Dispositions

- **adopt**: the upstream source, with mechanical changes only.
- **adapt**: the upstream source, with a change to behavior, types, or the public interface.
- **merge**: upstream source combined with an earlier local implementation.
- **defer**: not included now. A later decision is necessary.
- **reject**: not included.
- **local**: no upstream equivalent.

Mechanical changes apply to all upstream files and are not repeated in the table: `cn` from the
`cn` package, `#components/*` imports, sorted object keys, `{children}` in place of fragments, and
lint suppressions with a reason.

## Verification status

`apps/catalog` does not exist yet (issue #163). Thus no component has catalog stories or recorded
iOS and Android checks. The "Code audit" column records the source audit of 2026-09-21: public
exports, private upstream types, Uniwind tokens, accessibility roles, disabled behavior, and
reduced motion. Do not describe a component as verified until it has device evidence.

Reanimated applies `ReduceMotion.System` by default. The overlay components also set it
explicitly on their enter and exit animations.

## Upstream components

Providers: **Portal** means the consuming app must mount a `PortalHost` from
`@rn-primitives/portal` near the root.

| Component                   | Disposition | Dependencies                                                                                                                | Providers | Local changes                                                                                                                                                                      | Code audit | Stories | iOS     | Android |
| --------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------- | ------- |
| `accordion`                 | adapt       | `@rn-primitives/accordion`, `lucide-react-native`, `react-native-reanimated`                                                | None      | `AccordionProps` type replaces the upstream cast. The trigger text class is a constant.                                                                                            | Pass       | Pending | Pending | Pending |
| `alert`                     | adopt       | `lucide-react-native`                                                                                                       | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `alert-dialog`              | adopt       | `@rn-primitives/alert-dialog`, `react-native-reanimated`, `react-native-screens`                                            | Portal    | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `aspect-ratio`              | adopt       | `@rn-primitives/aspect-ratio`                                                                                               | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `avatar`                    | adopt       | `@rn-primitives/avatar`                                                                                                     | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `badge`                     | adopt       | `@rn-primitives/slot`, `class-variance-authority`                                                                           | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `button`                    | adapt       | `class-variance-authority`                                                                                                  | None      | `accessibilityRole="button"` replaces `role`.                                                                                                                                      | Pass       | Pending | Pending | Pending |
| `card`                      | adapt       | None                                                                                                                        | None      | `accessibilityRole="header"` replaces `role="heading"` on the title.                                                                                                               | Pass       | Pending | Pending | Pending |
| `checkbox`                  | adopt       | `@rn-primitives/checkbox`, `lucide-react-native`                                                                            | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `collapsible`               | adopt       | `@rn-primitives/collapsible`                                                                                                | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `context-menu`              | adapt       | `@rn-primitives/context-menu`, `lucide-react-native`, `react-native-reanimated`, `react-native-screens`                     | Portal    | The overlay style logic has no type cast.                                                                                                                                          | Pass       | Pending | Pending | Pending |
| `dialog`                    | adopt       | `@rn-primitives/dialog`, `lucide-react-native`, `react-native-reanimated`, `react-native-screens`                           | Portal    | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `dropdown-menu`             | adapt       | `@rn-primitives/dropdown-menu`, `lucide-react-native`, `react-native-reanimated`, `react-native-screens`                    | Portal    | The overlay style logic has no type cast.                                                                                                                                          | Pass       | Pending | Pending | Pending |
| `hover-card`                | adopt       | `@rn-primitives/hover-card`, `react-native-reanimated`, `react-native-screens`                                              | Portal    | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `icon`                      | adopt       | `lucide-react-native`, `uniwind`                                                                                            | None      | None. The consuming app must list `lucide-react-native` as a dependency.                                                                                                           | Pass       | Pending | Pending | Pending |
| `input`                     | adapt       | None                                                                                                                        | None      | `placeholderTextColorClassName` sets the native placeholder color. Uniwind ignores the upstream `placeholder:` class on native. The unused `placeholderClassName` prop is removed. | Fixed      | Pending | Pending | Pending |
| `label`                     | adopt       | `@rn-primitives/label`                                                                                                      | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `menubar`                   | adapt       | `@rn-primitives/menubar`, `@rn-primitives/portal`, `lucide-react-native`, `react-native-reanimated`, `react-native-screens` | Portal    | `value` and `onValueChange` have explicit types. The unused `overlayClassName` and `overlayStyle` props of `MenubarContent` are removed.                                           | Pass       | Pending | Pending | Pending |
| `native-only-animated-view` | adopt       | `react-native-reanimated`                                                                                                   | None      | None. This is a support component for the overlay components.                                                                                                                      | Pass       | Pending | Pending | Pending |
| `popover`                   | adopt       | `@rn-primitives/popover`, `react-native-reanimated`, `react-native-screens`                                                 | Portal    | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `progress`                  | adopt       | `@rn-primitives/progress`, `react-native-reanimated`                                                                        | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `radio-group`               | adopt       | `@rn-primitives/radio-group`                                                                                                | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `select`                    | adopt       | `@rn-primitives/select`, `lucide-react-native`, `react-native-reanimated`, `react-native-screens`                           | Portal    | None. `SelectScrollUpButton` and `SelectScrollDownButton` render on web only.                                                                                                      | Pass       | Pending | Pending | Pending |
| `separator`                 | adopt       | `@rn-primitives/separator`                                                                                                  | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `skeleton`                  | adapt       | `react-native-reanimated`                                                                                                   | None      | The shared value API is `get` and `set`.                                                                                                                                           | Fixed      | Pending | Pending | Pending |
| `switch`                    | adopt       | `@rn-primitives/switch`                                                                                                     | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `tabs`                      | adopt       | `@rn-primitives/tabs`                                                                                                       | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `text`                      | adapt       | `@rn-primitives/slot`, `class-variance-authority`                                                                           | None      | Functions replace the role and level lookup tables. The `blockquote` variant uses the `border-border` token.                                                                       | Pass       | Pending | Pending | Pending |
| `textarea`                  | adapt       | None                                                                                                                        | None      | Same placeholder change as `input`.                                                                                                                                                | Fixed      | Pending | Pending | Pending |
| `toggle`                    | adopt       | `@rn-primitives/toggle`, `class-variance-authority`                                                                         | None      | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |
| `toggle-group`              | adapt       | `@rn-primitives/toggle-group`, `class-variance-authority`                                                                   | None      | The context value is memoized. `??` replaces the logical OR for the context fallback.                                                                                              | Pass       | Pending | Pending | Pending |
| `tooltip`                   | adopt       | `@rn-primitives/tooltip`, `react-native-reanimated`, `react-native-screens`                                                 | Portal    | None                                                                                                                                                                               | Pass       | Pending | Pending | Pending |

## Local components

| Component            | Disposition | Dependencies                                                             | Providers                        | Platform support                                                                              | Code audit | Stories | iOS     | Android |
| -------------------- | ----------- | ------------------------------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------- | ---------- | ------- | ------- | ------- |
| `large-title-header` | local       | `expo-router`, `expo-glass-effect`, `react-native-reanimated`, `uniwind` | An Expo Router `Stack` navigator | iOS uses the native large-title header and search bar. Android and web use a fallback header. | Pass       | Pending | Pending | Pending |

## Audit findings of 2026-09-21

- `skeleton`: the earlier local version returned `withRepeat` directly from `useAnimatedStyle`.
  Reanimated starts such an animation at its target value, so the opacity stayed at 0.5 and the
  component did not pulse. The component now drives the animation from a shared value that starts
  at 1, as upstream does.
- `input` and `textarea`: Uniwind does not apply the `placeholder:` variant on native, so the
  placeholder did not use the theme color. This defect is also in upstream. The components now set
  `placeholderTextColorClassName` on native.
- `large-title-header`: a relative import of `utils` is now the `#utils.ts` subpath import.
- No component imports a private upstream type or a `@/registry` path.
- All runtime dependencies in `package.json` have a consumer. `react-native-svg` has no direct
  import; it is the peer dependency of `lucide-react-native`. No dependency is used only by
  rejected or superseded code, because no upstream component is rejected.

## Not in the upstream registry

Plan documents mention Toast, Sheet, Drawer, Command, and ActivityIndicator. The pinned Uniwind
registry does not contain them. Each one needs a separate public interface decision before it is
added as a local component.

The `connect-backend` generator template `mobile-auth/_layout.tsx.hbs` renders a loading state.
It uses `ActivityIndicator` from `react-native`, because this package has no
`components/activity-indicator` subpath. If the package gets a themed indicator, update the
template and add an inventory row in the same change.
