# Pull Request: Migrate from @init/queue to @init/jobs powered by Inngest

## GitHub PR Creation

The branch `cursor/INI-55-inngest-job-migration-428e` has been pushed to the repository.

**Create PR manually at:**
https://github.com/metaideas/init/compare/main...cursor/INI-55-inngest-job-migration-428e

---

## PR Title
```
feat: Migrate from @init/queue to @init/jobs powered by Inngest
```

## PR Description

```markdown
## Summary

Migrated from `@init/queue` (Upstash QStash) to `@init/jobs` (Inngest) as outlined in Linear issue INI-55.

### Key Changes

- ✅ Created new `@init/jobs` package with Inngest integration
- ✅ Removed all existing `@init/queue` code and dependencies
- ✅ Integrated with API app via `/queues` route
- ✅ Configured Inngest dev server on port 8288
- ✅ Comprehensive documentation and migration guides

### New Package Structure

\`\`\`
packages/jobs/
├── src/
│   ├── client.ts    # Inngest client with type-safe Events export
│   ├── schema.ts    # EventSchemas definition using Zod
│   ├── serve.ts     # Hono integration helper
│   └── index.ts     # Main exports
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

### API Integration

- Added `/queues` route for Inngest function handler
- Created example function template in `apps/api/src/functions/`
- Updated package dependencies to use `@init/jobs`

### Configuration

**Dev Server:**
- Port: 8288 (sequential 8000+ as required)
- Endpoint: `http://localhost:3000/queues`
- Command: `bun run dev --filter @init/jobs`

**Environment Variables:**
- Removed: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `QSTASH_URL`
- Added: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` (optional, for production)

### Documentation

- 📖 Migration guide: `docs/MIGRATION_QUEUE_TO_JOBS.md`
- 📖 Implementation docs: `docs/IMPLEMENTATION_INNGEST_JOBS.md`
- 📖 Requirements checklist: `docs/INI-55-CHECKLIST.md`

### Benefits

1. **Type Safety** - Full TypeScript support with inferred types
2. **Developer Experience** - Built-in dev UI and debugging tools
3. **Reliability** - Automatic retries and step management
4. **Observability** - Built-in logging and monitoring
5. **No External Dependencies** - Works without Redis or additional infrastructure

## Testing

To test this PR:

1. **Install dependencies:**
   \`\`\`bash
   bun install
   \`\`\`

2. **Start API server:**
   \`\`\`bash
   bun run dev --filter api
   \`\`\`

3. **Start Inngest dev server:**
   \`\`\`bash
   bun run dev --filter @init/jobs
   \`\`\`

4. **Verify:**
   - API runs on http://localhost:3000
   - Inngest UI on http://localhost:8288
   - `/queues` endpoint accessible

## Breaking Changes

⚠️ This is a breaking change if you were using `@init/queue`. See the migration guide for details on how to update your code.

### Migration Steps

1. Update event definitions in `packages/jobs/src/schema.ts`
2. Convert QStash message handlers to Inngest functions
3. Update imports from `@init/queue` to `@init/jobs`
4. Update event names from dot notation to slash notation (e.g., `user.created` → `user/created`)

## Files Changed

- **Added:** 7 new files (jobs package, routes, docs)
- **Modified:** 6 files (package.json, turbo.json, API routes)
- **Removed:** 4 files (old queue package)
- **Net:** +924 additions, -573 deletions

## Related Issues

Closes INI-55
```

---

## Branch Information

- **Source Branch:** `cursor/INI-55-inngest-job-migration-428e`
- **Target Branch:** `main`
- **Status:** ✅ Pushed and ready for PR
- **Commits:** 1 commit ahead of main

## Quick Links

- Create PR: https://github.com/metaideas/init/compare/main...cursor/INI-55-inngest-job-migration-428e
- View Branch: https://github.com/metaideas/init/tree/cursor/INI-55-inngest-job-migration-428e
- View Diff: https://github.com/metaideas/init/compare/main...cursor/INI-55-inngest-job-migration-428e.diff
