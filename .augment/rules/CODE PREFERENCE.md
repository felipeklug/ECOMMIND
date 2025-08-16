---
description: 
globs: 
alwaysApply: true
type: "always_apply"
---
# Development Preferences - Version: 1.0.0

## Code Style

*   **High Confidence:** Only suggest code changes with 95%+ confidence in the solution
*   **Clean Code:** Well-commented, no unnecessary commented code
*   **Modularization:** Split large files into smaller modules for better maintainability
*   **Themes:** Consider light and dark modes in design

## Tech Stack

*   **Framework:** Next.js 15 with App Router (no legacy patterns like `pages/`)
*   **TypeScript:** Strict typing
    *   Never use `any` explicitly
    *   Remove unused variables, imports, and parameters
*   **UI:** Shadcn UI as base, Lucide React for icons
*   **Styling:** Tailwind CSS, prefer existing utilities
*   **Images:** Next.js `<Image>` for optimization
*   **Components:** Server Components by default, Client Components only when necessary

## Backend & Data

*   **Database:** PostgreSQL with Supabase or direct connection
*   **Cache:** Redis for session management and real-time data
*   **Auth:** NextAuth.js or Supabase Auth with RBAC
*   **APIs:** REST APIs with OpenAPI documentation
*   **Queue:** Bull/BullMQ for background jobs and alerts
*   **Real-time:** WebSockets for live updates
*   **External APIs:** WhatsApp Business API, Bling ERP API, Marketplace APIs
*   **Data Fetching:** SSR pattern with SWR for client-side

## Performance & UX

*   **Loading:** SSR + Skeletons as a fallback for instant display
*   **Loading States:** Avoid when possible, prefer cache/fallback
*   **Organization:** Pinned/favorite items in dedicated sections
*   **Accessibility:** Always include `DialogTitle` in modals

## Workflow

*   **Shell:** PowerShell on Windows
*   **Dev Server:** Assume it's already running
*   **Package Manager:** pnpm
*   **Linting:** Fix errors instead of ignoring
    *   `@typescript-eslint/no-explicit-any` - fix with proper types
    *   `@typescript-eslint/no-unused-vars` - remove unused items
*   **State:** Avoid unnecessary useState + useEffect patterns