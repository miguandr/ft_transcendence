📁 Project Structure

```
async-scrum-hub/
├── frontend/                 # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Base components (Button, Input, etc.)
│   │   │   └── features/    # Feature-specific components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, API client, etc.
│   │   ├── styles/          # Global styles, tokens
│   │   └── types/           # Frontend-only types
│   ├── public/
│   └── package.json
│
├── backend/                  # NestJS/Express + TypeScript
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── common/          # Shared utilities
│   │   ├── config/          # Configuration
│   │   └── main.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Migration history
│   │   └── seed.ts          # Seed data
│   └── package.json
│
├── shared/                   # Shared TypeScript types (CRITICAL)
│   └── types/
│       ├── api.types.ts     # Generic API types
│       ├── auth.types.ts    # Auth-related types
│       ├── user.types.ts    # User types
│       └── ... (one file per domain)
│
├── docs/                     # Documentation
│   ├── API_CONTRACTS.md     # Endpoint specifications
│   ├── ARCHITECTURE.md      # System architecture
│   ├── USER_STORIES.md      # Product requirements
│   └── WEBSOCKET_EVENTS.md  # Real-time event specs
│
├── .vscode/                  # VSCode settings (shared)
│   ├── settings.json
│   └── extensions.json
│
├── docker-compose.yml        # Local development setup
├── .env.example              # Environment variables template
├── .gitignore
├── .prettierrc.json
├── .eslintrc.json
└── README.md
```


🧩 Component-Driven Development (Frontend)

### Component Structure

```
src/components/
├── ui/                    # Base components (reusable)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.types.ts
│   │   └── index.ts
│   └── ... (Card, Modal, Badge, etc.)
│
└── features/              # Feature-specific components
    ├── auth/
    │   ├── LoginForm.tsx
    │   ├── SignupForm.tsx
    │   └── ProtectedRoute.tsx
    └── dashboard/
        ├── SprintBoard.tsx
        ├── TaskCard.tsx
        └── StandupFeed.tsx
```
