# Folder structure

## Top-level frontend layout

```
frontend/
├── docs_frontend/          # Documentation for frontend (this folder)
├── public/                 # Static assets (vite.svg, etc.)
├── src/                    # Source code (see below)
├── eslint.config.js
├── index.html              # Vite entry point
├── package.json
├── postcss.config.mjs
├── tsconfig.json           # Root TS config (references app + node)
├── tsconfig.app.json       # App TS config
├── tsconfig.node.json      # Node TS config (for vite.config.ts)
└── vite.config.ts          # Vite config
```

## `src/` folder structure

```
src/
├── main.tsx                # App entry point (renders App into #root)
├── App.tsx                 # Root component (router, layout switch)
├── index.css               # Global styles (Tailwind directives)
├── components/
│   ├── layout/             # Layout components (Sidebar, TopBar)
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── ui/                 # Shared UI primitives (shadcn/ui style)
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── alert-dialog.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── input-otp.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       ├── tooltip.tsx
│       ├── use-mobile.ts    # Hook for mobile detection
│       └── utils.ts         # cn() helper (clsx + tailwind-merge)
└── features/               # Feature modules (pages/screens)
    ├── analytics/
    │   └── Analytics.tsx
    ├── auth/
    │   ├── Login.tsx
    │   ├── RoleSelection.tsx
    │   ├── SignUp.tsx
    │   ├── TeamCreation.tsx
    │   ├── TeamJoin.tsx
    │   └── Welcome.tsx
    ├── blockers/
    │   ├── Blockers.tsx
    │   └── BlockersEmpty.tsx
    ├── dashboard/
    │   └── Dashboard.tsx
    ├── sprint_board/
    │   └── SprintBoard.tsx
    ├── standups/
    │   ├── AsyncStandup.tsx
    │   └── AsyncStandupEmpty.tsx
    └── team_health/
        └── TeamHealth.tsx
```

## Conventions

- **`components/layout/`** — App-wide layout components (Sidebar, TopBar).
- **`components/ui/`** — Reusable UI primitives (buttons, cards, dialogs, etc.). These are generic and not tied to any feature.
- **`features/`** — Feature-based organization. Each feature folder contains screens/pages for that domain (auth, dashboard, sprint board, etc.).
- **Entry flow:** `main.tsx` → `App.tsx` (routing) → feature screens.
- **No `services/` or `hooks/` folders yet** — will add when wiring backend APIs.

## Notes

- `components/ui/` currently has ~50 primitives (many from shadcn/ui). Consider creating a barrel (`index.ts`) for cleaner imports.
- Feature folders are flat (one or two files per feature). As features grow, co-locate components and add subfolders like `features/auth/components/`, `features/auth/hooks/`, etc.
- `App.tsx` handles routing and conditional layout (pre-auth screens don't show Sidebar/TopBar).
