# Design System

This document explains the design philosophy, styling approach, and component library used in ScrumHub.

---

## 🎨 Design Philosophy

### Visual Identity

**ScrumHub** uses a clean, modern design that prioritizes clarity and readability for distributed teams:

- **Clean & Minimal**: White backgrounds with subtle shadows and borders
- **Accent Color**: Cyan (#06b6d4) for primary actions and active states
- **Soft Pastels**: Mint green, pink, yellow, blue for avatars and status indicators
- **Rounded Corners**: Consistent border radius for cards, buttons, and inputs (12-16px)
- **Generous Whitespace**: Breathing room between elements for better focus

### Design Principles

1. **Clarity Over Decoration**: Every pixel serves a purpose
2. **Consistency**: Reusable patterns across all screens
3. **Accessibility**: High contrast, readable text, keyboard navigation
4. **Responsive**: Works on desktop, tablet, and mobile
5. **Fast**: No heavy animations, instant feedback

---

## 🛠️ Styling Approach

### Why Tailwind CSS?

We chose **Tailwind CSS v4** as our styling solution for several reasons:

**Pros**:
- ✅ **Utility-first**: Style directly in JSX without context switching
- ✅ **No CSS files**: No separate stylesheets to manage
- ✅ **Consistent design tokens**: Spacing, colors, and typography baked in
- ✅ **Faster development**: No naming conventions (BEM, etc.)
- ✅ **Tree-shakeable**: Only used utilities make it to production
- ✅ **Easy customization**: Extend theme in `tailwind.config.js`

**Example**:
```tsx
// Before (CSS modules)
<div className={styles.card}>
  <h2 className={styles.title}>Dashboard</h2>
</div>

// After (Tailwind)
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
</div>
```

### Design Tokens

Our Tailwind config defines consistent tokens:

**Colors**:
- Primary: `cyan-600` (#06b6d4) - Buttons, links, active states
- Success: `green-500` - Completed tasks, checkmarks
- Warning: `yellow-400` - Pending items
- Error: `red-500` - Blockers, validation errors
- Gray scale: `gray-50` to `gray-900` - Text, borders, backgrounds

**Spacing**: 
- 4px increments (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, etc.)
- Standard padding: `p-6` (24px) for cards
- Standard gap: `gap-4` (16px) between elements

**Typography**:
- Base: 14px (`text-sm`)
- Headings: `text-xl` (20px), `text-2xl` (24px), `text-3xl` (30px)
- Font: System font stack (fast, native look)

**Border Radius**:
- Buttons/Inputs: `rounded-xl` (12px)
- Cards: `rounded-xl` (12px)
- Avatars: `rounded-full` (perfect circle)

**Shadows**:
- Subtle: `shadow-sm` - Cards, elevated elements
- None on hover (keeping it flat)

---

## 🧩 Component Library

### Architecture: shadcn/ui Pattern

We use the **shadcn/ui** approach for our component library:

**What is shadcn/ui?**
- Not an npm package—you **own the code**
- Components copied into your project (`components/ui/`)
- Built on **Radix UI** primitives (headless, accessible)
- Styled with **Tailwind CSS**
- Uses **CVA** (class-variance-authority) for variants

**Why this approach?**
- ✅ **Full control**: Customize without fighting abstractions
- ✅ **No bloat**: Only include components you need
- ✅ **No version lock**: No breaking changes from npm updates
- ✅ **Accessible by default**: Radix handles ARIA, keyboard nav, focus
- ✅ **Type-safe**: Full TypeScript support

### Component Inventory

We have **~50 UI primitives** in `src/components/ui/`:

#### Core Components (Most Used)
- **Button**: Primary actions, variants (default, destructive, outline, ghost, link)
- **Card**: Container for grouped content (Dashboard stats, Recent Updates, Sprint Progress)
- **Avatar**: User profile images with fallback initials (see screenshot: AK, ML, JL, SC)
- **Input**: Text fields for forms (Login, SignUp, search bars)
- **Badge**: Status indicators (In Progress, Completed, Blockers)
- **Dialog**: Modals for creating tickets, confirmations
- **Alert**: Error/success messages

#### Form Components
- Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Label

#### Layout Components
- Card, Separator, Tabs, Accordion, Collapsible, Scroll Area

#### Overlay Components
- Dialog, Alert Dialog, Drawer, Sheet, Popover, Tooltip, Dropdown Menu

#### Navigation Components
- Breadcrumb, Pagination, Navigation Menu

#### Display Components
- Avatar, Badge, Table, Calendar, Carousel, Chart (recharts wrapper)

#### Feedback Components
- Alert, Toast (Sonner), Progress, Skeleton (loading states)

**Full list**: See `components/ui/` folder for all 50+ components.

---

## 📐 Design Patterns from Screenshot

Looking at the Dashboard screen, here are the key patterns:

### 1. **Layout Structure**
```
┌─────────────┬──────────────────────────────────────────┐
│             │ TopBar (Search, Notifications, Avatar)   │
│  Sidebar    ├──────────────────────────────────────────┤
│  (Nav)      │                                          │
│             │  Main Content Area                       │
│             │  (White background)                      │
│             │                                          │
└─────────────┴──────────────────────────────────────────┘
```

**Implementation**:
- Sidebar: Fixed left, `bg-white`, `border-r border-gray-200`
- TopBar: Fixed top, `bg-white`, `border-b border-gray-200`
- Main: `bg-gray-50`, scrollable content area

### 2. **Stat Cards** (In Progress / Completed / Blockers)
```tsx
<div className="bg-white p-6 rounded-xl border border-gray-200">
  <div className="flex items-center gap-2 mb-2">
    <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center">
      <Clock className="w-3 h-3 text-cyan-600" />
    </div>
    <span className="text-sm text-gray-600">In Progress</span>
  </div>
  <div className="text-3xl font-bold text-gray-900">8</div>
  <div className="text-xs text-gray-400">tasks</div>
</div>
```

**Pattern**: Icon in colored circle + label + large number + small subtitle

### 3. **Recent Updates List** (Alex Kim, Maria Lopez, Jordan Lee)
```tsx
<div className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg">
  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
    <span className="text-sm font-semibold text-green-800">AK</span>
  </div>
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-900">Alex Kim</span>
      <span className="text-xs text-gray-400">2h ago</span>
    </div>
    <p className="text-sm text-gray-600">Completed API integration for user auth</p>
  </div>
</div>
```

**Pattern**: Pastel avatar circle with initials + name + timestamp + message

### 4. **Progress Bar** (Sprint Progress)
```tsx
<div>
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-medium text-gray-700">Sprint Progress</span>
    <span className="text-sm text-gray-500">Week 2 of 2</span>
  </div>
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className="h-full bg-cyan-500 rounded-full" style={{ width: "65%" }} />
  </div>
  <span className="text-xs text-gray-400 mt-1">24 of 37 tasks completed</span>
</div>
```

**Pattern**: Label + subtext above, colored bar, small caption below

### 5. **Sidebar Navigation**
```tsx
<nav className="space-y-1">
  <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-cyan-50 text-cyan-700">
    <LayoutDashboard className="w-5 h-5" />
    <span className="text-sm font-medium">Dashboard</span>
  </a>
  <a href="/board" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600">
    <KanbanSquare className="w-5 h-5" />
    <span className="text-sm">Sprint Board</span>
  </a>
</nav>
```

**Pattern**: Icon + label, active state has cyan background and bold text

---

## 🚀 Current Status

### ✅ What's Built
- All 50+ UI primitives available in `components/ui/`
- Consistent Tailwind styling across all screens
- Design tokens configured in `tailwind.config.js`
- Icons library (lucide-react) heavily used
- Layout components (Sidebar, TopBar) implemented

### ❌ What's NOT Being Used Yet
- **Zero `components/ui/` imports in features**
- Features use plain HTML elements styled directly with Tailwind
- Custom avatar divs instead of `<Avatar>` component
- Plain buttons instead of `<Button>` component
- Plain divs instead of `<Card>` component

**Example of current approach** (Dashboard.tsx):
```tsx
// Current (not using components)
<div className="bg-white p-6 rounded-xl border border-gray-200">
  <button className="w-full px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">
    Log in
  </button>
</div>

// Should be (using components)
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

<Card>
  <Button variant="default" size="lg" className="w-full">
    Log in
  </Button>
</Card>
```

---

## 🎯 Recommended Refactors

To improve consistency and maintainability:

### 1. **Replace Plain Buttons → `<Button>`**
**Where**: Login, SignUp, Sprint Board, Dashboard  
**Why**: Centralized styling, variants (primary, secondary, ghost), consistent hover states  
**Example**:
```tsx
// Before
<button className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">
  Log in
</button>

// After
<Button variant="default" size="lg">Log in</Button>
```

### 2. **Replace Custom Avatars → `<Avatar>`**
**Where**: Dashboard (Recent Updates), Sidebar, TopBar, Standup, Blockers  
**Why**: Handles image loading, fallback initials, consistent sizing  
**Example**:
```tsx
// Before
<div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
  <span className="text-sm font-semibold text-green-800">AK</span>
</div>

// After
<Avatar>
  <AvatarFallback className="bg-green-200 text-green-800">AK</AvatarFallback>
</Avatar>
```

### 3. **Replace Plain Divs → `<Card>`**
**Where**: Dashboard stats, Recent Updates, Sprint Progress, Analytics metrics  
**Why**: Consistent padding, shadows, borders  
**Example**:
```tsx
// Before
<div className="bg-white p-6 rounded-xl border border-gray-200">
  <h2>Dashboard</h2>
</div>

// After
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

### 4. **Use `<Dialog>` for Modals**
**Where**: Sprint Board "Add Ticket" modal  
**Why**: Accessibility (focus trap, ESC to close), animations, backdrop  

### 5. **Use `<Input>` for Forms**
**Where**: Login, SignUp, Sprint Board, Team Creation  
**Why**: Consistent styling, error states, accessibility  

### 6. **Add `<Skeleton>` for Loading States**
**Where**: Dashboard, Sprint Board, Analytics (when fetching data)  
**Why**: Better UX than blank screens  

### 7. **Add `<Alert>` or Toast for Feedback**
**Where**: After login success, API errors, form submissions  
**Why**: User feedback for actions  

---

## 💡 Usage Guide

### Basic Import Pattern
```tsx
// Import what you need
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Use in component
export function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Good morning, Sarah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Sarah Chen</p>
            <Badge variant="secondary">Product Manager</Badge>
          </div>
        </div>
        <Button variant="default" size="lg" className="w-full">
          Start Sprint
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Component Variants

Most components support variants via `variant` prop:

**Button**:
- `default` - Cyan background (primary action)
- `destructive` - Red background (delete, cancel)
- `outline` - Border only (secondary action)
- `secondary` - Gray background
- `ghost` - No background (tertiary action)
- `link` - Text only (looks like link)

**Badge**:
- `default` - Gray
- `secondary` - Light gray
- `destructive` - Red
- `outline` - Border only

**Alert**:
- `default` - Blue info
- `destructive` - Red error

---

## 📦 Future Improvements

### Short Term
- [ ] Create barrel export file (`components/ui/index.ts`) for easier imports
- [ ] Refactor Login.tsx to use `<Button>` and `<Input>`
- [ ] Replace all custom avatars with `<Avatar>`
- [ ] Use `<Card>` for Dashboard stat cards

### Medium Term
- [ ] Add `<Skeleton>` to all data-fetching screens
- [ ] Implement toast notifications with Sonner
- [ ] Use `<Dialog>` for Sprint Board modal
- [ ] Add dark mode support (Tailwind has built-in classes)

### Long Term
- [ ] Build complex composed components (DashboardStatCard, UpdateListItem)
- [ ] Create Storybook for component documentation
- [ ] Add unit tests for UI components
- [ ] Performance audit (bundle size, render times)

---

## 🎯 Key Takeaways

1. **Tailwind + shadcn/ui pattern** = Fast development + full control
2. **50+ components built** but **0 used in features yet** (everything is plain HTML)
3. **Next step**: Refactor features to use Button, Card, Avatar, Input, Dialog
4. **Design is clean & modern**: White backgrounds, cyan accents, pastel avatars, rounded corners
5. **Consistency matters**: Using components ensures uniform look across all screens
