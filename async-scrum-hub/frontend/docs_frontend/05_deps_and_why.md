# Dependencies and Why

This document explains every dependency in `package.json` and why it's needed for the ScrumHub frontend.

---

## Runtime Dependencies (`dependencies`)

These are required for the app to run in production.

### **react** (^19.2.0)

- **What**: Core React library
- **Why**: Foundation of our UI - handles component rendering, state management, and the virtual DOM
- **Usage**: Every `.tsx` component file uses React

### **react-dom** (^19.2.0)

- **What**: React's DOM renderer
- **Why**: Bridges React components to the browser's DOM (renders JSX to HTML)
- **Usage**: `main.tsx` uses `createRoot()` to mount the app

### **react-router-dom** (^7.11.0)

- **What**: Client-side routing library
- **Why**: Enables navigation between screens without page reloads (SPA routing)
- **Usage**:
    - `main.tsx` defines routes (`/login`, `/dashboard`, etc.)
    - Components use `useNavigate()` hook for programmatic navigation
    - Example: `navigate("/")` after successful login

### **lucide-react** (^0.562.0)

- **What**: Icon library with 1000+ SVG icons as React components
- **Why**: Provides consistent, scalable icons across the app
- **Usage**:
    - Used heavily in all feature screens
    - Example: `<Calendar />`, `<Users />`, `<BarChart3 />`
    - Better than image icons (scalable, styled with CSS)

### **recharts** (^3.6.0)

- **What**: React charting library built on D3
- **Why**: Powers data visualizations in Analytics and Team Health screens
- **Usage**:
    - `Analytics.tsx`: Line charts, bar charts for sprint metrics
    - `TeamHealth.tsx`: Trend visualizations
    - Chosen over Chart.js for better React integration

---

## Development Dependencies (`devDependencies`)

These are only needed during development (not in production builds).

### Build Tools

#### **vite** (^7.2.4)

- **What**: Lightning-fast build tool and dev server
- **Why**:
    - Instant hot module reload (HMR) during development
    - Optimized production builds (code splitting, tree shaking)
    - Native ESM support (faster than Webpack/CRA)
- **Usage**: `npm run dev` starts Vite dev server on port 5173

#### **@vitejs/plugin-react** (^5.1.1)

- **What**: Official Vite plugin for React
- **Why**: Enables React Fast Refresh (preserves state on hot reload) and JSX transformation
- **Usage**: Configured in `vite.config.ts`

### TypeScript

#### **typescript** (~5.9.3)

- **What**: TypeScript compiler
- **Why**:
    - Type safety prevents runtime errors
    - Better IDE autocomplete and refactoring
    - Required for `.tsx` files
- **Usage**: `tsc -b` compiles TypeScript to JavaScript before build

#### **@types/react** (^19.2.5)

- **What**: Type definitions for React
- **Why**: Enables TypeScript to understand React APIs (`useState`, `useEffect`, etc.)
- **Usage**: Auto-imported when using React in `.tsx` files

#### **@types/react-dom** (^19.2.3)

- **What**: Type definitions for ReactDOM
- **Why**: Provides types for `createRoot()`, `render()`, etc.
- **Usage**: Used in `main.tsx`

#### **@types/node** (^24.10.1)

- **What**: Type definitions for Node.js APIs
- **Why**: Allows TypeScript to understand Node globals (`process`, `__dirname`, etc.)
- **Usage**: Used in Vite config and build scripts

### Styling

#### **tailwindcss** (^4.1.18)

- **What**: Utility-first CSS framework
- **Why**:
    - Rapid UI development with utility classes (`flex`, `p-4`, `bg-cyan-600`)
    - No CSS file management (styles in JSX)
    - Consistent design system (spacing, colors)
- **Usage**: Every component uses Tailwind classes

#### **@tailwindcss/cli** (^4.1.18)

- **What**: Tailwind's standalone CLI tool
- **Why**: Processes Tailwind utilities and generates optimized CSS
- **Usage**: Runs automatically during `npm run dev`

#### **@tailwindcss/postcss** (^4.1.18)

- **What**: PostCSS plugin for Tailwind v4
- **Why**: Integrates Tailwind with Vite's PostCSS pipeline
- **Usage**: Configured in `postcss.config.mjs`

#### **postcss** (^8.5.6)

- **What**: CSS transformation tool
- **Why**: Required by Tailwind to process CSS (runs plugins like Autoprefixer)
- **Usage**: Configured in `postcss.config.mjs`

#### **autoprefixer** (^10.4.23)

- **What**: PostCSS plugin that adds vendor prefixes
- **Why**: Ensures CSS works across browsers (`-webkit-`, `-moz-`, etc.)
- **Usage**: Runs automatically via PostCSS

### Linting

#### **eslint** (^9.39.1)

- **What**: JavaScript/TypeScript linter
- **Why**: Enforces code quality and catches bugs before runtime
- **Usage**: `npm run lint` checks all files

#### **@eslint/js** (^9.39.1)

- **What**: ESLint's core JavaScript rules
- **Why**: Provides recommended rule sets
- **Usage**: Imported in `eslint.config.js`

#### **typescript-eslint** (^8.46.4)

- **What**: ESLint plugin for TypeScript
- **Why**: Adds TypeScript-specific linting rules (type checks, interface naming)
- **Usage**: Configured in `eslint.config.js`

#### **eslint-plugin-react-hooks** (^7.0.1)

- **What**: ESLint rules for React Hooks
- **Why**: Prevents common Hook mistakes (missing dependencies, incorrect usage)
- **Usage**: Auto-enabled in ESLint config

#### **eslint-plugin-react-refresh** (^0.4.24)

- **What**: ESLint rules for React Fast Refresh
- **Why**: Ensures components are compatible with hot reload
- **Usage**: Warns if exports prevent HMR

#### **globals** (^16.5.0)

- **What**: Database of global variables
- **Why**: Tells ESLint which globals are valid (`window`, `document`, `console`)
- **Usage**: Configured in `eslint.config.js`

---

## Why These Choices?

### Why Vite over Create React App?

- **Speed**: 10-100x faster dev server startup
- **Modern**: Native ESM, better tree shaking
- **Future**: CRA is deprecated, Vite is actively maintained

### Why Tailwind over CSS/SCSS?

- **Productivity**: No context switching (HTML + styles in one file)
- **Consistency**: Design tokens built-in (spacing, colors)
- **Size**: PurgeCSS removes unused styles (tiny bundle)

### Why Recharts over Chart.js?

- **React-first**: Built for React (no refs or lifecycle hacks)
- **Composable**: Build charts like React components
- **Declarative**: Easier to reason about than imperative APIs

### Why lucide-react over Font Awesome?

- **Tree-shakeable**: Only bundle icons you use
- **React components**: No `<i>` tag hacks
- **Modern**: Clean, consistent design system

---

## Missing Dependencies (Future)

Consider adding these as the project grows:

### State Management

- **zustand** or **jotai** - When local state gets complex
- **@tanstack/react-query** - For API caching and server state

### Forms

- **react-hook-form** - Better form validation
- **zod** - Schema validation (replace manual checks)

### Testing

- **vitest** - Fast unit tests (Vite-native)
- **@testing-library/react** - Component testing
- **playwright** - E2E tests

### Utilities

- **date-fns** - Date formatting and manipulation
- **clsx** - Conditional className composition

---

## Update Policy

- **React/TypeScript**: Stay on latest stable (security + features)
- **Vite**: Update frequently (performance improvements)
- **Tailwind**: Major versions carefully (breaking changes in v4)
- **Recharts**: Update cautiously (chart APIs can break)
