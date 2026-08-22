<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Huishoudboekje — agent guide

## Toolchain

- **Next.js 16** (App Router), **React 19**, **TypeScript strict**, **npm**
- **No Tailwind.** All styling is plain CSS via `app/globals.css` (custom properties + utility classes)
- **motion** (not framer-motion) — import from `"motion/react"`
- **Zod 4.x** — API differs from Zod 3, check before writing schemas
- **ESLint 9 flat config** — `eslint.config.mjs`

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # ESLint (flat config)
npx jest         # run tests (no npm script — must use npx)
npx jest --watch # watch mode
npx jest --coverage  # with 80% threshold
```

## Architecture

- **All components are `"use client"`** — Firebase is client-only; the init module (`app/lib/firebase.ts`) throws on the server
- **Path alias `@/` maps to project root** (not `src/`), e.g. `@/app/lib/firebase`
- **Route groups:** `(auth)` = public pages, `(dashboard)` = protected layout with `<Header>`
- **State:** React Context + `useReducer` in `app/lib/contexts/`; realtime Firestore via custom hooks in `app/lib/hooks/`
- **UI text is in Dutch** — keep it consistent

## Testing

- Tests live in `__tests__/`, mirroring `app/` structure
- Manual mocks in `__mocks__/` for: `firebase/auth`, `firebase/firestore`, `@dnd-kit/core`, `motion/react`, `next/navigation`, `recharts`
- `app/__mocks__/firebase.ts` is a manual mock for `@/app/lib/firebase` (loaded via `jest.setup.ts`)
- Use `renderWithProviders` from `__tests__/test-utils.tsx` to wrap components with mock auth + boekje context
- Coverage threshold: **80%** across statements, branches, functions, lines (`firebase.ts` excluded)

## Key files

| Purpose | Path |
|---|---|
| Firebase init | `app/lib/firebase.ts` |
| Firestore CRUD | `app/lib/services/firestore.ts` |
| Zod schemas + types | `app/lib/schemas.ts` |
| Auth context | `app/lib/contexts/auth-context.tsx` |
| Boekje context | `app/lib/contexts/boekje-context.tsx` |
| Realtime hooks | `app/lib/hooks/` |
| Root layout | `app/layout.tsx` |
| Dashboard page | `app/(dashboard)/page.tsx` |
| Boekje detail | `app/(dashboard)/boekje/[id]/page.tsx` |
| Test helpers | `__tests__/test-utils.tsx` |
| Jest config | `jest.config.ts` |
| ESLint config | `eslint.config.mjs` |
