# Testing standards

Apply these rules when you write or change tests.

- Use Bun to manage packages and execute scripts.
- Use `bun:test`.
- Add tests to a `__tests__` folder beside the file they test.
- Import `describe`, `expect`, and `test` from `bun:test`.
- Name each `describe` block after its function.
- Name each test case after its behavior.
- Use `bun run build --filter=<workspace>` for builds of a target workspace.
