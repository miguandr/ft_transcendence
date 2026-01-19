# Setup and tooling

### Initial scaffold
- Created Vite React + TypeScript project
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  ```

### Installed dependencies
- **react-router-dom** — client-side routing
- **lucide-react** — icon library
- **recharts** — charting library for Analytics page
- **Tailwind CSS** — utility-first styling

```bash
npm install react-router-dom lucide-react recharts
```

### Tailwind CSS setup
Followed the official Vite + Tailwind install guide:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Updated `tailwind.config.js` to include content paths:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Added Tailwind directives to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Common errors and fixes

#### 1. Screen layout rendered in a single column
**Issue:** Components stacked vertically instead of expected flex/grid layout.

**Cause:** Tailwind not applied or wrong content paths in config.

**Fix:** Verified `tailwind.config.js` `content` array includes `./src/**/*.{js,ts,jsx,tsx}` and restarted dev server.

---

#### 2. Buttons rendering in black (invisible text)
**Issue:** Button text was black-on-black or invisible after installing Tailwind.

**Cause:** Tailwind's `@tailwind base;` applies a CSS reset that removes default button styling and sets `color: inherit`. Some custom CSS presets or base styles conflicted with Tailwind's reset.

**Fix:** Deleted conflicting CSS presets in `src/index.css`. Ensured only Tailwind directives remained or that custom styles explicitly set text colors (e.g., `text-white`, `text-gray-900`). After cleanup, Tailwind utility classes (`text-white`, `bg-cyan-600`, etc.) worked correctly.

---

### Dev server
```bash
npm run dev
```

Vite dev server runs on `http://localhost:5173` by default.

---

## Tooling summary
- **Build tool:** Vite
- **Framework:** React 19 + TypeScript
- **Routing:** react-router-dom
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Charts:** recharts
- **Linting:** ESLint (configured by Vite template)
