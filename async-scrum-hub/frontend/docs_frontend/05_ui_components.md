# UI components

## Overview

The `src/components/ui/` folder contains ~50 reusable UI primitives following the shadcn/ui pattern (built on Radix UI + Tailwind + class-variance-authority). These components are generic and can be used across features.

## Current component inventory

All components live in `src/components/ui/`. Below is the full list, categorized by usage status.

### ✅ In active use

Currently, **none** of the `components/ui/` primitives are imported or used in feature screens yet. Features render plain HTML elements (div, button, input, form, etc.) styled directly with Tailwind utility classes.

**Icons (lucide-react)** are heavily used across features:
- Dashboard: `Clock`, `CheckCircle2`, `AlertCircle`
- Sprint Board: `Plus`, `X`
- Sidebar: `LayoutDashboard`, `KanbanSquare`, `MessageSquare`, `AlertCircle`, `BarChart3`, `Activity`
- TopBar: `Bell`, `Search`, `LogOut`
- Blockers: `AlertCircle`, `Clock`, `CheckCircle2`
- Team Health: `AlertTriangle`, `TrendingDown`, `Clock`, `Users`, `CheckCircle2`
- Auth screens: `Users`, `Code`, `Target`, `Copy`, `Check`, `MessageSquare`, `Columns`, `Flag`

### 📦 Available (design-only / not yet used)

These components are ready to use but haven't been imported in any feature yet:

#### Form & input
- `button.tsx` — Button component with variants (default, destructive, outline, secondary, ghost, link)
- `input.tsx` — Text input
- `textarea.tsx` — Multi-line text input
- `checkbox.tsx` — Checkbox
- `radio-group.tsx` — Radio buttons
- `select.tsx` — Dropdown select
- `switch.tsx` — Toggle switch
- `slider.tsx` — Range slider
- `form.tsx` — Form field wrapper (react-hook-form integration)
- `input-otp.tsx` — OTP input field
- `label.tsx` — Form label

#### Layout
- `card.tsx` — Card container (Card, CardHeader, CardTitle, CardContent, CardFooter)
- `separator.tsx` — Horizontal/vertical divider
- `tabs.tsx` — Tab navigation
- `accordion.tsx` — Collapsible sections
- `collapsible.tsx` — Toggle-able content
- `resizable.tsx` — Resizable panels
- `scroll-area.tsx` — Custom scrollable area
- `aspect-ratio.tsx` — Maintain aspect ratio wrapper
- `sidebar.tsx` — Sidebar layout primitives

#### Overlay & feedback
- `dialog.tsx` — Modal dialog
- `alert-dialog.tsx` — Alert/confirmation dialog
- `drawer.tsx` — Side drawer
- `sheet.tsx` — Slide-out panel
- `popover.tsx` — Popover
- `tooltip.tsx` — Tooltip
- `hover-card.tsx` — Hover card
- `context-menu.tsx` — Right-click context menu
- `dropdown-menu.tsx` — Dropdown menu
- `menubar.tsx` — Menu bar
- `command.tsx` — Command palette (cmdk)
- `alert.tsx` — Alert banner
- `sonner.tsx` — Toast notifications
- `progress.tsx` — Progress bar
- `skeleton.tsx` — Loading skeleton

#### Navigation
- `breadcrumb.tsx` — Breadcrumb navigation
- `pagination.tsx` — Pagination controls
- `navigation-menu.tsx` — Navigation menu

#### Display
- `avatar.tsx` — Avatar (currently using custom gradient divs in features)
- `badge.tsx` — Badge/pill
- `table.tsx` — Data table
- `calendar.tsx` — Date picker calendar
- `carousel.tsx` — Image/content carousel
- `chart.tsx` — Chart wrapper (recharts integration)
- `toggle.tsx` — Toggle button
- `toggle-group.tsx` — Group of toggle buttons

#### Utilities
- `utils.ts` — `cn()` helper for merging Tailwind classes (clsx + tailwind-merge)
- `use-mobile.ts` — Hook for mobile breakpoint detection

---

## Recommended refactors

1. **Replace plain buttons with `<Button>` component** in features (Login, SignUp, Sprint Board modal, etc.) for consistent styling and variants.
2. **Replace custom avatar divs with `<Avatar>` component** across Dashboard, Standup, Blockers, Sidebar, TopBar.
3. **Use `<Card>` component** for Dashboard stat cards, Blocker cards, Standup cards, Analytics metric cards.
4. **Use `<Dialog>` for Sprint Board's "Add Ticket" modal** instead of custom modal markup.
5. **Use `<Input>`, `<Textarea>`, `<Select>` in forms** (Login, SignUp, Sprint Board modal) for consistency.
6. **Add `<Alert>` or `<Sonner>` toasts** for error/success feedback when wiring backend APIs.
7. **Use `<Skeleton>` for loading states** once data fetching is implemented.

## Usage pattern

Once you start using these components, import them directly:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Example
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default" size="lg">Click me</Button>
  </CardContent>
</Card>
```

For easier imports, consider adding a barrel file (`components/ui/index.ts`) to export all components from one location.

---

## Status summary

- **Total UI components:** ~50
- **Currently used in features:** 0 (features use plain HTML + Tailwind)
- **Icons (lucide-react):** Heavily used across all features
- **Next step:** Refactor feature screens to use `Button`, `Card`, `Avatar`, `Dialog`, `Input` for consistency and maintainability.
