---
description: 
globs: 
alwaysApply: true
type: "always_apply"
---
# Design Guidelines

## Purpose & Scope

Standards for building consistent, maintainable, and visually appealing user interfaces. Covers component architecture, styling conventions, color systems, typography, responsive design, accessibility, and performance using Shadcn UI, Tailwind CSS, and modern Next.js/React best practices.

## Core Principles

- **UI Framework:** Shadcn UI components as primary building blocks
- **Styling:** Tailwind CSS for all styling needs, configured in `globals.css`
- **Responsiveness:** Desktop-first design with graceful mobile adaptation
- **Images:** Next.js `<Image>` component for optimization
- **Icons:** Lucide React icons, import only what's needed
- **Components:** Server Components by default, Client Components only when necessary
- **TypeScript:** Strict typing for component props
- **Accessibility:** WCAG compliance
- **Colors & Fonts:** Always use values defined in `globals.css`
- **Buttons:** All button-like components must have `cursor-pointer` class

## Component Architecture

### Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── layout.tsx
│       └── _components/  # Route-specific components
├── components/           # Shared reusable components
│   ├── ui/               # Shadcn UI components
│   ├── shared/           # App-wide components
│   └── forms/            # Form components
├── features/             # Feature-specific components
├── lib/                  # Utilities and helpers
└── public/               # Static assets
```

### Component Strategy

- **Shadcn UI First:** Use Shadcn UI components from `@/components/ui/*`
- **Server vs Client:**
  - Server Components by default
  - Client Components only for interactivity (`useState`, `useEffect`, events)
- **Installation:** `pnpm dlx shadcn-ui@latest add <component-name>`
- **Custom Components:**
  - Build using Shadcn UI + Tailwind utilities
  - Use kebab-case for file names, PascalCase for exports
  - Keep small, focused, and reusable
- **TypeScript:** Define explicit prop types, avoid `any`

### Examples

```typescript
// ✅ Client component for interactivity
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  )
}

// ✅ Server component for static content
import { Card } from "@/components/ui/card"
export function StaticCard() { /* ... */ }
```

## Color System

Use semantic CSS variables in `globals.css`:

```css
:root {
  --background: oklch(1 0 0); /* #ffffff */
  --foreground: oklch(0.141 0.005 285.823); /* #1f1f21 */
  --primary: oklch(0.21 0.006 285.885); /* #2a2a2e */
  --card: oklch(1 0 0); /* #ffffff */
  --border: oklch(0.898 0.002 286.38); /* #e4e4e7 */
}

.dark {
  --background: oklch(0.141 0.005 285.823); /* #1f1f21 */
  --foreground: oklch(0.98 0 0); /* #f8f8f8 */
  --primary: oklch(0.92 0.004 286.32); /* #e4e4e7 */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-card: var(--card);
  --color-border: var(--border);
}
```

**Usage:**
```typescript
// ✅ Use semantic classes
<div className="bg-background text-foreground border border-border">
  <Button className="bg-primary text-primary-foreground">Click</Button>
</div>

// ❌ Don't hardcode colors
<div className="bg-[#ffffff] text-[#1f1f21]">...</div>
```

## Typography

- **Global Font:** Inter configured in `layout.tsx` and `globals.css`
- **Custom Utilities:** Define text styles in `globals.css`

```css
@layer utilities {
  .text-heading {
    @apply text-2xl font-bold leading-tight;
  }
  .text-body {
    @apply text-base leading-relaxed;
  }
  .text-caption {
    @apply text-sm text-muted-foreground;
  }
}
```

## Styling Practices

- **Configuration:** All Tailwind customization in `globals.css` using `@theme inline` and `@layer utilities`
- **No Config File:** Avoid `tailwind.config.js` unless absolutely necessary
- **Utility Classes:** Use Tailwind utilities directly in components
- **Organization:** Group classes by category (layout, typography, colors)

```typescript
// ✅ Good organization
<div className="flex flex-col gap-4 p-6 bg-card text-card-foreground rounded-lg border border-border">
  <h2 className="text-heading text-primary">Title</h2>
  <p className="text-body text-muted-foreground">Content</p>
</div>
```

## Responsive Design

- **Primary Targets:** Desktop (1920x1080) and notebook (1366x768)
- **Graceful Degradation:** Ensure mobile usability without horizontal scrolling
- **Flexible Layouts:** Use relative units, Flexbox, Grid
- **Breakpoints:** Tailwind responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)

```typescript
// ✅ Responsive layout
<div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto p-4">
  <div className="w-full md:w-1/2 bg-card p-6 rounded-lg">
    <h2 className="text-xl md:text-2xl font-bold">Section 1</h2>
  </div>
  <div className="w-full md:w-1/2 bg-card p-6 rounded-lg">
    <h2 className="text-xl md:text-2xl font-bold">Section 2</h2>
  </div>
</div>
```

## Data Fetching Integration

```typescript
// SWR for client-side fetching
const { data, isLoading, error } = useSWR<DataType>('/api/data');

// Loading wrapper pattern
<Card>
  <LoadingContent loading={isLoading} error={error}>
    {data && <DisplayComponent data={data} />}
  </LoadingContent>
</Card>
```

## Form Components

```typescript
// Shadcn + react-hook-form
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const { register, formState: { errors } } = useForm();

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    {...register("email", { required: "Email is required" })}
    className={cn(errors.email && "border-destructive")}
  />
  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
</div>
```

## Accessibility

- **Semantic HTML:** Use proper elements (`<nav>`, `<button>`, `<main>`)
- **ARIA:** Apply roles and attributes for screen readers
- **Keyboard Navigation:** All interactive elements focusable
- **Color Contrast:** Meet WCAG AA requirements
- **Labels:** Clear labels for form inputs

## Performance

- **Server Components:** Minimize client-side JavaScript
- **Unused Styles:** Build process removes unused CSS
- **Image Optimization:** Use `next/image` component

## Restrictions

- **MUST NOT** hardcode color values in `className` props
- **MUST NOT** define theme variables outside `globals.css`
- **MUST NOT** use arbitrary values when theme utilities exist
- **MUST NOT** create horizontal scrolling layouts

## Conventions

- Place file mentions at the end of responses when referencing this guideline.
- Use consistent formatting for all code examples and file paths.
- Organize Tailwind classes by category (layout, typography, colors) for readability in complex components.

## Related Rules

- `@next-shadcn-coding-standards.mdc` - General Next.js, React, TypeScript, and Shadcn best practices.
- `@cursor_project.mdc` - Overall project structure and technology stack overview.
- `@page-structure.mdc` - Guidelines for page structure within the App Router.

## Suggested Metadata

- **description:** "Comprehensive design guidelines for Eventware UI, covering component architecture, styling with Tailwind CSS, color systems, typography, and responsive design practices."
- **globs:**
- **alwaysApply:** true