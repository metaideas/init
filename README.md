# init

A monorepo for building everywhere.

Contains:

- Web application using Next.js
- Mobile application using Expo
- APIs using Hono & Cloudflare Workers
- Desktop application using Tauri, Vite and Tanstack Router
- Browser extension using WXT
- Documentation site using Next.js + Fumadocs

## Development

To start the development server, run `pnpm dev` on the root directory.

### Ports

Apps run in the 3000-3999 range. Packages run in the 8000-8999 range.

- Web: 3000
- API: 3001
- Mobile: 3002
- Desktop: 3003
- Extension: 3004
- Docs: 3005

- Email: 8081
- Queue: 8288
