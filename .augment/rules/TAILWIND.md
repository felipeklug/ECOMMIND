---
description: This rule explains Tailwind CSS conventions, utility classes, and best practices for modern UI development.
globs: ["**/*.tsx", "**/*.jsx", "**/*.html", "**/*.css"]
alwaysApply: false
---

# Tailwind CSS Rules for ECOMMIND - Version: 1.0.0

## Color Palette

Use ECOMMIND brand colors consistently:

```css
/* Primary Colors (WhatsApp inspired) */
.bg-primary { @apply bg-green-600; }
.bg-primary-dark { @apply bg-green-700; }
.bg-primary-light { @apply bg-green-50; }

/* Secondary Colors */
.bg-secondary { @apply bg-slate-600; }
.bg-accent { @apply bg-blue-600; }

/* Status Colors */
.bg-success { @apply bg-green-500; }
.bg-warning { @apply bg-yellow-500; }
.bg-error { @apply bg-red-500; }
.bg-info { @apply bg-blue-500; }
```

## Component Patterns

### Dashboard Cards
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">Card Title</h3>
  <div class="space-y-3">
    <!-- Card content -->
  </div>
</div>
```

### WhatsApp-style Messages
```html
<div class="bg-green-100 rounded-lg p-3 max-w-xs ml-auto">
  <p class="text-sm text-gray-800">Outgoing message</p>
  <span class="text-xs text-gray-500">10:30</span>
</div>

<div class="bg-white rounded-lg p-3 max-w-xs border border-gray-200">
  <p class="text-sm text-gray-800">Incoming message</p>
  <span class="text-xs text-gray-500">10:32</span>
</div>
```

### Alert Components
```html
<div class="bg-red-50 border border-red-200 rounded-lg p-4">
  <div class="flex items-start">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-red-400"><!-- Alert icon --></svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">Alert Title</h3>
      <p class="text-sm text-red-700 mt-1">Alert message</p>
    </div>
  </div>
</div>
```

## Responsive Design

- Use mobile-first approach for e-commerce managers on-the-go:

```html
<div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  <!-- Responsive grid for product cards -->
</div>
```

- Optimize for tablet viewing in meetings:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Dashboard metrics -->
</div>
```

## Interactive Elements

- Use consistent hover states:

```html
<button class="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
  Primary Action
</button>
```

- Loading states for real-time data:

```html
<div class="animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

## Data Visualization

- Consistent spacing for metrics:

```html
<div class="space-y-6">
  <div class="bg-white p-6 rounded-lg border">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-500">Revenue Today</h3>
      <span class="text-2xl font-bold text-gray-900">R$ 12.450</span>
    </div>
  </div>
</div>
```

- Status indicators:

```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  In Stock
</span>
```

## Utility Patterns

- Use @apply for repeated component patterns:

```css
@layer components {
  .metric-card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }

  .btn-whatsapp {
    @apply bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .alert-critical {
    @apply bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg;
  }
}
```

- Consistent spacing system:

```html
<div class="space-y-4 md:space-y-6">
  <!-- Vertical spacing that adapts to screen size -->
</div>
```

## Accessibility

- Ensure proper contrast ratios:

```html
<div class="bg-gray-900 text-white"> <!-- High contrast -->
<div class="bg-gray-100 text-gray-900"> <!-- High contrast -->
```

- Focus states for keyboard navigation:

```html
<button class="focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
  Accessible Button
</button>
```