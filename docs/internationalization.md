# Internationalization

The files in `tooling/internationalization/messages/` are the source catalogs for every
application workspace. Keep all locale files structurally identical and update every
locale when adding a message.

## Message Keys

Use flat, semantic keys in lower snake case. Build each key from the message's durable
ownership and role:

```text
<surface>_<feature>_<element>_<role>
```

Not every key needs all four segments. Use only the segments needed to make the message
unambiguous:

```text
api_hello_greeting
desktop_local_files_empty_state
shared_locale_switch
web_landing_hero_headline_first
```

- Start with the application workspace or `shared` for messages genuinely used across
  multiple surfaces.
- Follow the repository's feature boundaries where they exist.
- Name the final segment after the message's UI or domain role, not its current English
  wording.
- Treat an assigned key as a stable identifier. Do not rename it only because the copy
  changes or a component moves.
- Give independently evolving messages separate keys even when their current source text
  is identical.
- Do not use nested JSON or dotted keys. Flat keys compile to direct `m.key()` calls and
  remain readable in editors without translation previews.

## Adding Messages

1. Add the same key to `tooling/internationalization/messages/en.json` and every
   translated catalog.
2. Preserve the same variables, markup, and variants in every locale.
3. Run `bun run format` to keep the catalogs consistently formatted.
4. Run `bun run codegen` to regenerate each workspace's Paraglide output.
5. Run `bun run check` before committing.

The message-format plugin sorts keys in ascending order when it writes the catalogs. This
keeps related prefixes together and reduces diff noise.
