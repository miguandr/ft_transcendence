# Design System

This document explains the design philosophy, styling approach, and component library used in ScrumHub.

---

## 🎨 Design Philosophy

### Visual Identity

**ScrumHub** uses a clean, modern design that prioritizes clarity and readability for distributed teams:

-   **Clean & Minimal**: White backgrounds with subtle shadows and borders
-   **Accent Color**: Cyan (#06b6d4) for primary actions and active states
-   **Soft Pastels**: Mint green, pink, yellow, blue for avatars and status indicators
-   **Rounded Corners**: Consistent border radius for cards, buttons, and inputs (12-16px)
-   **Generous Whitespace**: Breathing room between elements for better focus

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

-   ✅ **Utility-first**: Style directly in JSX without context switching
-   ✅ **No CSS files**: No separate stylesheets to manage
-   ✅ **Consistent design tokens**: Spacing, colors, and typography baked in
-   ✅ **Faster development**: No naming conventions (BEM, etc.)
-   ✅ **Tree-shakeable**: Only used utilities make it to production
-   ✅ **Easy customization**: Extend theme in `tailwind.config.js`

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

-   Primary: `cyan-600` (#06b6d4) - Buttons, links, active states
-   Success: `green-500` - Completed tasks, checkmarks
-   Warning: `yellow-400` - Pending items
-   Error: `red-500` - Blockers, validation errors
-   Gray scale: `gray-50` to `gray-900` - Text, borders, backgrounds

**Spacing**:

-   4px increments (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, etc.)
-   Standard padding: `p-6` (24px) for cards
-   Standard gap: `gap-4` (16px) between elements

**Typography**:

-   Base: 14px (`text-sm`)
-   Headings: `text-xl` (20px), `text-2xl` (24px), `text-3xl` (30px)
-   Font: System font stack (fast, native look)

**Border Radius**:

-   Buttons/Inputs: `rounded-xl` (12px)
-   Cards: `rounded-xl` (12px)
-   Avatars: `rounded-full` (perfect circle)

**Shadows**:

-   Subtle: `shadow-sm` - Cards, elevated elements
-   None on hover (keeping it flat)

---

## 🧩 Component Library

### Architecture: Two-Layer Component System

We use a **two-layer component architecture**:

**Layer 1: UI Primitives** (`components/ui/`)

-   **shadcn/ui** approach (Radix UI + Tailwind + CVA)
-   ~50 headless, accessible components
-   Not directly used in features (too low-level)
-   Available for building higher-level components

**Layer 2: Custom Components** (`components/custom/`)

-   **Application-specific components** built for ScrumHub
-   Opinionated styling matching our design system
-   Used directly in features (Login, SignUp, Dashboard, etc.)
-   Built on top of UI primitives OR standalone with Tailwind

**Why two layers?**

-   ✅ **UI primitives** provide accessibility and behavior (Radix)
-   ✅ **Custom components** enforce consistent styling across features
-   ✅ **Separation of concerns**: Behavior (ui/) vs. Style (custom/)
-   ✅ **Easier to use**: Import from one place, pre-styled for ScrumHub

### Custom Component Inventory (18 Components)

**Currently in use** (Login.tsx, SignUp.tsx):

-   ✅ **Button**: Primary actions with loading states and variants
-   ✅ **Input**: Text fields with error states and icons
-   ✅ **Label**: Form labels with consistent styling
-   ✅ **ErrorText**: Validation error messages (red text)
-   ✅ **HintText**: Helper text below inputs (gray text)
-   ✅ **PageContainer**: Centered layout wrapper for auth pages

**Available but not yet used**:

-   **Avatar**: User profile images with fallback initials
-   **Badge**: Status indicators (In Progress, Completed, Blockers)
-   **Card**: Container for grouped content
-   **EmptyState**: Placeholder for empty lists/data
-   **IconBox**: Colored circle container for icons
-   **MetricCard**: Dashboard stat cards (number + label + icon)
-   **Modal**: Dialog for confirmations/forms
-   **PageHeader**: Page title + breadcrumbs + actions
-   **Select**: Dropdown for form selections
-   **StatCard**: Dashboard statistics display
-   **TaskCard**: Sprint board task cards
-   **UpdateItem**: Activity feed item with avatar + message

**Full list**: See `components/custom/index.ts` for all exports.

### UI Primitives Inventory (50+ Components)

Available in `src/components/ui/` but **not directly imported in features**:

#### Core Components

-   Button, Card, Avatar, Input, Badge, Dialog, Alert

#### Form Components

-   Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Label

#### Layout Components

-   Card, Separator, Tabs, Accordion, Collapsible, Scroll Area

#### Overlay Components

-   Dialog, Alert Dialog, Drawer, Sheet, Popover, Tooltip, Dropdown Menu

#### Navigation Components

-   Breadcrumb, Pagination, Navigation Menu

#### Display Components

-   Avatar, Badge, Table, Calendar, Carousel, Chart (recharts wrapper)

#### Feedback Components

-   Alert, Toast (Sonner), Progress, Skeleton (loading states)

**Usage**: These are building blocks for creating custom components, not for direct use in features.

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

-   Sidebar: Fixed left, `bg-white`, `border-r border-gray-200`
-   TopBar: Fixed top, `bg-white`, `border-b border-gray-200`
-   Main: `bg-gray-50`, scrollable content area

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
	<a
		href="/board"
		className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600"
	>
		<KanbanSquare className="w-5 h-5" />
		<span className="text-sm">Sprint Board</span>
	</a>
</nav>
```

**Pattern**: Icon + label, active state has cyan background and bold text

---

## 🚀 Current Status

### ✅ What's Built & In Use

**Component Architecture**:

-   ✅ 50+ UI primitives in `components/ui/` (Radix + Tailwind)
-   ✅ 18 custom components in `components/custom/`
-   ✅ Barrel export pattern (`components/custom/index.ts`)
-   ✅ Consistent Tailwind styling across all components

**Authentication Pages** (Login.tsx, SignUp.tsx):

-   ✅ Using `<Button>` component with loading states and variants
-   ✅ Using `<Input>` component with error states
-   ✅ Using `<Label>` for form accessibility
-   ✅ Using `<ErrorText>` for validation feedback
-   ✅ Using `<HintText>` for field descriptions
-   ✅ Using `<PageContainer>` for centered layout
-   ✅ Improved email validation regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
-   ✅ Changed from `type="email"` to `type="text"` for consistent validation

**Testing**:

-   ✅ 28 passing unit tests (13 SignUp, 15 Login)
-   ✅ Email validation edge cases tested
-   ✅ API integration mocked and tested
-   ✅ Error handling scenarios covered

**Design System**:

-   ✅ Consistent Tailwind tokens configured
-   ✅ Icons library (lucide-react) integrated
-   ✅ Layout components (Sidebar, TopBar) implemented

### ⚠️ Partially Used

**Custom Components** (built but not fully adopted):

-   ⚠️ Avatar, Badge, Card, StatCard, MetricCard - available but not in auth pages
-   ⚠️ TaskCard, UpdateItem - built for Dashboard but not integrated yet
-   ⚠️ Modal, Select, PageHeader - ready for feature development

**UI Primitives** (available but not directly imported):

-   ⚠️ All 50+ shadcn/ui components in `components/ui/`
-   ⚠️ These are building blocks, features use custom components instead

### ❌ Not Yet Implemented

-   [ ] Dashboard refactored to use custom components
-   [ ] Sprint Board using TaskCard component
-   [ ] Team Health using MetricCard component
-   [ ] Dark mode support
-   [ ] Toast notifications (Sonner integration ready)
-   [ ] Skeleton loading states
-   [ ] Component Storybook documentation

---

## 🎯 Recommended Next Steps

### 1. **Expand Custom Component Usage**

**Where**: Dashboard, Sprint Board, Team Health, Analytics
**What**: Use existing custom components:

-   Replace stat divs with `<StatCard>` or `<MetricCard>`
-   Replace avatar divs with `<Avatar>`
-   Replace plain cards with `<Card>`
-   Use `<Badge>` for task status
-   Use `<TaskCard>` for sprint board items
-   Use `<UpdateItem>` for activity feeds

**Example**: Dashboard stat refactor

```tsx
// Before (plain div)
<div className="bg-white p-6 rounded-xl border border-gray-200">
  <div className="flex items-center gap-2 mb-2">
    <Clock className="w-5 h-5 text-cyan-600" />
    <span className="text-sm text-gray-600">In Progress</span>
  </div>
  <div className="text-3xl font-bold">8</div>
  <div className="text-xs text-gray-400">tasks</div>
</div>

// After (custom component)
<MetricCard
  icon={Clock}
  label="In Progress"
  value={8}
  unit="tasks"
  variant="cyan"
/>
```

### 2. **Add Loading States**

**Where**: All data-fetching screens
**What**: Show skeletons while loading

```tsx
import { Skeleton } from "@/components/ui/skeleton";

{
	isLoading ? <Skeleton className="h-24 w-full" /> : <MetricCard {...data} />;
}
```

### 3. **Add Toast Notifications**

**Where**: After form submissions, API calls
**What**: User feedback for actions

```tsx
import { toast } from "sonner";

// Success
toast.success("Login successful!");

// Error
toast.error("Invalid credentials");
```

### 4. **Build Composed Components**

**What**: Combine custom components into feature-specific patterns
**Examples**:

-   `<DashboardHeader>` = PageHeader + Avatar + QuickActions
-   `<ActivityFeed>` = Multiple UpdateItems in scrollable container
-   `<SprintProgressCard>` = Card + Progress bar + Stats

### 5. **Add Form Validation Library**

**Why**: Current manual validation works but could be cleaner
**Consider**: React Hook Form + Zod

```tsx
// Future improvement (optional)
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});
```

### 6. **Document Custom Components**

**What**: Add JSDoc comments and usage examples
**Where**: Each component in `components/custom/`
**Example**:

```tsx
/**
 * Button component with loading states and variants
 *
 * @example
 * <Button variant="primary" isLoading={loading}>
 *   Save Changes
 * </Button>
 */
export function Button({ ... }) { ... }
```

---

## 💡 Usage Guide

### Import Pattern (Custom Components)

**Best Practice**: Import from barrel export

```tsx
// ✅ Good - Import from index
import { Button, Input, Label, ErrorText, PageContainer } from "@/components/custom";

// ❌ Bad - Individual imports
import { Button } from "@/components/custom/Button";
import { Input } from "@/components/custom/Input";
```

### Real Example: Login.tsx

```tsx
import { Button, Input, Label, ErrorText, HintText, PageContainer } from "@/components/custom";

export function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [isLoading, setIsLoading] = useState(false);

	return (
		<PageContainer>
			<div className="w-full max-w-md">
				<h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>

				<form onSubmit={handleLogin} className="space-y-5">
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							type="text"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							hasError={!!errors.email}
							placeholder="you@company.com"
						/>
						{errors.email && <ErrorText>{errors.email}</ErrorText>}
					</div>

					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							hasError={!!errors.password}
						/>
						{!errors.password && <HintText>At least 8 characters</HintText>}
						{errors.password && <ErrorText>{errors.password}</ErrorText>}
					</div>

					<Button
						type="submit"
						variant="primary"
						isLoading={isLoading}
						className="w-full"
					>
						Log in
					</Button>
				</form>
			</div>
		</PageContainer>
	);
}
```

### Component Props Reference

**Button**:

```tsx
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "text"
  size="sm" | "md" | "lg"
  isLoading={boolean}
  disabled={boolean}
  className="w-full" // Additional Tailwind classes
  onClick={handleClick}
>
  Click Me
</Button>
```

**Input**:

```tsx
<Input
  type="text" | "password" | "email"
  value={value}
  onChange={onChange}
  hasError={boolean}
  placeholder="Enter text..."
  disabled={boolean}
  className="..." // Additional styling
/>
```

**Label**:

```tsx
<Label htmlFor="input-id">Field Name</Label>
```

**ErrorText**:

```tsx
<ErrorText>This field is required</ErrorText>
```

**HintText**:

```tsx
<HintText>Enter at least 8 characters</HintText>
```

**PageContainer**:

```tsx
<PageContainer>{/* Centered content */}</PageContainer>
```

---

## 📦 Recent Improvements & Future Work

### ✅ Recent Improvements (January 2026)

**Authentication Components**:

-   ✅ Built Login.tsx and SignUp.tsx using custom components
-   ✅ Improved email validation regex to catch edge cases (multiple @, spaces, etc.)
-   ✅ Changed input type from "email" to "text" for consistent validation across browser/tests
-   ✅ Added comprehensive error handling with ErrorText component
-   ✅ Added HintText for better UX (field descriptions)
-   ✅ Implemented loading states on buttons (isLoading prop)
-   ✅ Created 28 passing unit tests with Vitest

**Component System**:

-   ✅ Established two-layer architecture (UI primitives + Custom components)
-   ✅ Created barrel export for easy imports (`components/custom/index.ts`)
-   ✅ Built 18 reusable custom components
-   ✅ All components use consistent Tailwind styling

**Testing Infrastructure**:

-   ✅ Set up Vitest with Testing Library
-   ✅ Configured jsdom test environment
-   ✅ Created test utilities (mocks, helpers)
-   ✅ Achieved good coverage on auth flow

### 🚧 In Progress

-   [ ] Refactor Dashboard to use MetricCard, StatCard, UpdateItem
-   [ ] Add Avatar component to navigation and user profiles
-   [ ] Implement Modal component for forms and confirmations
-   [ ] Add toast notifications with Sonner

### 📋 Future Work

**Short Term** (Next Sprint):

-   [ ] Replace all plain avatars with `<Avatar>` component
-   [ ] Use `<Badge>` for task status indicators
-   [ ] Add `<Skeleton>` loading states to Dashboard
-   [ ] Implement `<Modal>` for Sprint Board "Add Task"
-   [ ] Add unit tests for custom components

**Medium Term** (Next Month):

-   [ ] Build composed components (DashboardStatGrid, ActivityFeed, etc.)
-   [ ] Add dark mode support (Tailwind classes ready)
-   [ ] Create Storybook documentation for all components
-   [ ] Performance audit (bundle size, render times)
-   [ ] Add E2E tests with Playwright

**Long Term** (Quarterly):

-   [ ] Component animation library (Framer Motion)
-   [ ] Advanced form validation (React Hook Form + Zod)
-   [ ] Accessibility audit and improvements
-   [ ] Design system documentation site
-   [ ] Component usage analytics

---

## 🎯 Key Takeaways

1. **Two-layer component system** works well:

    - UI primitives (components/ui/) provide behavior + accessibility
    - Custom components (components/custom/) enforce ScrumHub styling
    - Features import from custom layer only

2. **Custom components now in production**:

    - ✅ Button, Input, Label, ErrorText, HintText, PageContainer used in Login/SignUp
    - ✅ 28 passing tests validate component behavior
    - ✅ Consistent styling across authentication flow

3. **Barrel export pattern** simplifies imports:

    ```tsx
    import { Button, Input, Label } from "@/components/custom";
    ```

4. **Email validation improved**:

    - Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
    - Catches multiple @, spaces, missing domain/TLD
    - Consistent behavior in browser and tests

5. **Next steps clear**:

    - Expand custom component usage to Dashboard, Sprint Board
    - Add loading states (Skeleton) and notifications (Toast)
    - Build composed components for common patterns

6. **Design is clean & modern**:
    - White backgrounds, cyan accents, rounded corners
    - Consistent spacing and typography
    - Tailwind utility classes throughout

**Bottom line**: Component architecture is working. Login/SignUp prove the pattern. Now scale it to other features.
