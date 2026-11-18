# LTID — Digital Agricultural Cooperative (concept landing page)

An unofficial concept preview of a landing page for **Long Term Industrial Development (LTID)**, prepared for the JETRO job fair. Content is based on public information (ltid.jp, the FUNDINNO project page, the company introduction video).

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · next-intl (JA default + EN) · GSAP + ScrollTrigger + SplitText · Lenis · React Three Fiber (procedural 3D globe, custom GLSL)

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000  (redirects to /ja or /en by Accept-Language)
pnpm build
```

## Structure

- `app/[locale]/` — locale-prefixed routes (`/ja`, `/en`); `proxy.ts` negotiates locale
- `messages/{ja,en}.json` — all copy
- `components/sections/` — page sections; `components/three/` — globe scene; `lib/globeState.ts` links scroll → 3D
- `scripts/gen-land.mjs` — regenerates `lib/data/land-dots.json` from Natural Earth (world-atlas)

Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production URL for correct canonical/OG metadata.
