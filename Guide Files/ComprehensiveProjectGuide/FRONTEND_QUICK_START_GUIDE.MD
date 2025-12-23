########################################
🎨 Frontend Developer Quick Start Guide
########################################

Build the Entire UI Without Waiting for Backend

===============================================

🎯 Your Learning Path (1-2 Weeks)

Week 1: Core Concepts You Need

Day 1-2: React Fundamentals

What you need to know:
-Components (functional components with hooks)
-Props & State (useState, useEffect)
-Conditional rendering
-Lists & keys
-Event handling

Quick tutorial: https://react.dev/learn Focus on: "Describing the UI" and "Adding Interactivity" sections

Day 3-4: TypeScript Basics

What you need to know:
-Basic types (string, number, boolean)
-Interfaces & Types
-Function typing
-Optional properties (?)

Quick tutorial: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

Day 5-7: React + TypeScript Together

What you need to know:
-Typing props
-Typing state
-Typing event handlers
-Import/export types


🚀 Let's Get You Coding NOW (Today!)

Step 1: Setup Your Environment (30 minutes)

# Create project folder
mkdir async-scrum-hub
cd async-scrum-hub
mkdir frontend
cd frontend

# Create Vite React + TypeScript project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages you'll need
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install react-hook-form zod @hookform/resolvers
npm install clsx tailwind-merge

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
Step 2: Configure Tailwind (5 minutes)
Edit tailwind.config.js:
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
Replace src/index.css content:
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
Step 3: Create Type Definitions (10 minutes)
Create folder structure:
mkdir -p src/types
Create src/types/auth.types.ts:
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
Create src/types/api.types.ts:
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
Create src/types/index.ts:
export * from './auth.types';
export * from './api.types';
Step 4: Create Mock API (15 minutes)
Create src/lib/mockApi.ts:
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database (in-memory for now)
let mockUsers: Array<{ email: string; password: string; name: string; id: string }> = [
  {
    id: '1',
    email: 'demo@42.fr',
    name: 'Demo User',
    password: 'password123', // In real app, this would be hashed
  },
];

export const mockAuthApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    await delay(1000); // Simulate network

    const user = mockUsers.find(
      u => u.email === data.email && u.password === data.password
    );

    if (!user) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token-' + Date.now(),
      },
    };
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    await delay(1000);

    // Check if user exists
    if (mockUsers.find(u => u.email === data.email)) {
      return {
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      };
    }

    // Validate password
    if (data.password.length < 8) {
      return {
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters',
        },
      };
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      email: data.email,
      password: data.password,
      name: data.name,
    };

    mockUsers.push(newUser);

    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token-' + Date.now(),
      },
    };
  },

  me: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    await delay(500);

    // For mock, just return demo user
    return {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'demo@42.fr',
          name: 'Demo User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
  },
};
Create src/lib/utils.ts (helper for Tailwind classes):
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
Update tsconfig.json to add path alias:
{
  "compilerOptions": {
    // ... existing config
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
Update vite.config.ts:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});


===============================================

🎨 Building Your First Components (Start Here!)

Component 1: Button (30 minutes)

Create src/components/ui/Button.tsx:
import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
Test it in src/App.tsx:
import { Button } from '@/components/ui/Button';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Button Examples</h1>

        <div className="space-x-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="space-x-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <div>
          <Button isLoading>Loading Button</Button>
        </div>

        <div>
          <Button disabled>Disabled Button</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
Run it:
npm run dev

Open http://localhost:5173 - You should see beautiful buttons! 🎉


===================================

Component 2: Input (30 minutes)

Create src/components/ui/Input.tsx:

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';


===============================================

Test it in src/App.tsx:

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function App() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Input Examples</h1>

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          helperText="Must be at least 8 characters"
        />

        <Input
          label="Error Example"
          type="text"
          error="This field is required"
        />

        <Input
          label="Disabled"
          type="text"
          disabled
          value="Can't edit this"
        />

        <Button>Submit</Button>
      </div>
    </div>
  );
}

export default App;

=================================

Component 3: Login Form (1 hour)

Install form library:

npm install react-hook-form zod @hookform/resolvers

Create src/components/features/auth/LoginForm.tsx:

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockAuthApi } from '@/lib/mockApi';
import type { LoginRequest } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await mockAuthApi.login(data);

      if (response.success && response.data) {
        console.log('Login successful!', response.data.user);
        // TODO: Store token, redirect to dashboard
        alert(`Welcome, ${response.data.user.name}!`);
      } else {
        setApiError(response.error?.message || 'Login failed');
      }
    } catch (error) {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          label="Email"
          type="email"
          placeholder="demo@42.fr"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          helperText="Try: password123"
          {...register('password')}
        />
      </div>

      {apiError && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{apiError}</p>
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Log In
      </Button>

      <p className="text-sm text-gray-600 text-center">
        Demo account: demo@42.fr / password123
      </p>
    </form>
  );
}


Create login page src/pages/LoginPage.tsx:

import { LoginForm } from '@/components/features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Async Scrum Hub</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}


Update src/App.tsx:

import { LoginPage } from '@/pages/LoginPage';

function App() {
  return <LoginPage />;
}

export default App;

Test it:

Go to http://localhost:5173
Try logging in with: demo@42.fr / password123
Try wrong credentials
See form validation (empty fields, invalid email)

=============================================

🎯 Your Learning Path (Next 2 Weeks)

Week 1: Build Core Components & Auth Flow
✅ Day 1: Button, Input components
✅ Day 2: LoginForm (you just built this!)
📝 Day 3: SignupForm, Card component
📝 Day 4: Modal, Dropdown components
📝 Day 5: Auth context (store user state)
📝 Day 6-7: Protected routes, logout flow

Week 2: Build Dashboard & Sprint Board
📝 Day 8-9: Dashboard layout, Sidebar, Navbar
📝 Day 10-11: Sprint board (Kanban columns)
📝 Day 12-13: Task cards, create task modal
📝 Day 14: Drag-and-drop (react-beautiful-dnd)


📚 What to Learn Next (In Order)

1. React Router (Routing between pages)
npm install react-router-dom
Tutorial: https://reactrouter.com/en/main/start/tutorial You need: Navigate between Login, Signup, Dashboard pages

2. Context API (Global state for auth)
Tutorial: https://react.dev/reference/react/useContext You need: Store logged-in user, access from any component

3. React Query (Data fetching)
npm install @tanstack/react-query
Tutorial: https://tanstack.com/query/latest/docs/framework/react/quick-start You need: Fetch data, cache it, handle loading/error states

4. Drag and Drop (For Kanban board)
npm install react-beautiful-dnd
npm install --save-dev @types/react-beautiful-dnd

Tutorial: https://github.com/atlassian/react-beautiful-dnd You need: Drag tasks between Todo/Doing/Done columns


======================================
🚀 Next Steps (Do These Tomorrow)

Step 1: Create Signup Form (Similar to Login)
Create src/components/features/auth/SignupForm.tsx (I can help!)

Step 2: Setup Routing
Install:
npm install react-router-dom

Create basic routes:
/login → LoginPage
/signup → SignupPage
/dashboard → Dashboard (you'll build later)

Step 3: Create Auth Context
Store:
Current user
Token
isAuthenticated
login(), logout() functions


====================================

💡 Pro Tips for Learning

1. Don't Try to Learn Everything at Once
Focus on one concept at a time:
✅ Today: Components, Props, State
Tomorrow: Forms, Validation
Day 3: Routing
Day 4: Context API
etc.

2. Build Real Features (Not Tutorials)
Instead of: "Tutorial: Build a counter" Do: "Build the login form for my project" You'll learn faster because you have a real goal.

3. Use TypeScript from Day 1
You're already doing this! It might feel harder at first, but it catches SO many bugs.

4. When Stuck, Check These (In Order)
Error message (read it carefully!)
Console logs (console.log() is your friend)
Official docs
Ask me!

5. Commit Small, Commit Often
git add .
git commit -m "feat(ui): add Button component"
git commit -m "feat(ui): add Input component"
git commit -m "feat(auth): add LoginForm component"

🎉 You're Ready to Start!

Right now, you can build:
✅ All UI components (no backend needed!)
✅ All forms (with validation)
✅ All pages (routing)
✅ Mock data flows
When backend is ready (Week 2-3):
Change 1 line: mockAuthApi.login → authApi.login
Everything else stays the same!
Your folder structure will look like:
src/
├── components/
│   ├── ui/               # Your design system
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── features/         # Feature-specific components
│       └── auth/
│           ├── LoginForm.tsx
│           └── SignupForm.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── DashboardPage.tsx
├── lib/
│   ├── mockApi.ts        # Mock backend
│   └── utils.ts
├── types/
│   ├── auth.types.ts
│   └── api.types.ts
└── App.tsx

🆘 Need Help?

Stuck on a concept? Tell me what you're trying to do and I'll explain it simply. Want me to build the next component with you? Just say "Help me build [X]" and I'll guide you step-by-step. Not sure what to build next? I have a prioritized list ready for you! Ready for the next component? Let me know and we'll build it together! 🚀
