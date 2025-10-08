# Copilot Instructions for AI Coding Agents

## Project Overview

- This is a Next.js e-commerce app for a sneakers store, using TypeScript and React.
- Main features: product listing, category browsing, cart, checkout, admin panel, and purchase tracking.
- Firebase is used for backend services (see `firebase.json`, `lib/firebaseConfig.ts`).

## Architecture & Key Patterns

- **Pages**: All routes are in `pages/`, including dynamic routes like `products/[slug].tsx` and `collections/[slug].tsx`.
- **Components**: UI is modularized in `components/`, with subfolders for cards and shared elements.
- **Context**: App-wide state (auth, cart) is managed via React Context in `context/`.
- **Services**: Data fetching and business logic are in `services/` (e.g., `productService.ts`, `categoriesService.ts`).
- **Utilities**: Helper functions (e.g., Paystack integration, slug generation) are in `util/`.
- **Data**: Static data (e.g., Nigerian states) is in `data/`.

## Developer Workflows

- **Start Dev Server**: `npm run dev` (see README)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (uses `eslint.config.mjs`)
- **Type Checking**: `tsc --noEmit` (uses `tsconfig.json`)
- **Deploy**: Vercel recommended (see README)

## Project-Specific Conventions

- **TypeScript**: All code is typed; shared types in `types.ts`.
- **Dynamic Routing**: Use `[slug].tsx` for product/collection detail pages.
- **Context Usage**: Always wrap pages/components with relevant providers from `context/Providers.tsx`.
- **Service Layer**: Fetch data via service files, not directly in components.
- **Admin Features**: Admin pages are under `pages/admin/`.
- **Payment**: Paystack integration via `util/paystack.tsx` and related components.

## Integration Points

- **Firebase**: Configured in `lib/firebaseConfig.ts` and `firebase.json`.
- **Paystack**: Payment logic in `util/paystack.tsx`.
- **WhatsApp**: Customer support via `components/WhatsApp.tsx`.

## Examples

- To add a new product card, extend `components/cards/ProductCard.tsx` and update service logic in `services/productService.ts`.
- For new context, create in `context/`, export provider, and wrap in `context/Providers.tsx`.
- For new admin features, add to `pages/admin/` and follow existing patterns in `AdminPanel.tsx`.

## References

- Key files: `pages/`, `components/`, `context/`, `services/`, `util/`, `lib/`, `firebase.json`, `types.ts`
- See `README.md` for basic setup and deployment.

---

_Update this file as project conventions evolve. Ask for feedback if any section is unclear or incomplete._
