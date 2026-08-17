# UI standards

Apply these rules when you build the UI.

- Use `@init/ui` for the web UI and `@init/native-ui` for the mobile UI, importing one
  component per subpath (for example `@init/native-ui/components/button`).
- Use `cn` from `@init/utils/ui` to compose class names.
- Keep the web UI responsive and accessible.
- Keep the web UI compatible with dark mode.
- Compose the web UI from the existing Radix and Tailwind foundations.
