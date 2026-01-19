# How to Use Custom Components

This guide shows you where and how to replace existing code with your custom components.

---

## 📦 Components Created

1. **Button** - Replaces all `<button>` tags
2. **Input** - Replaces all `<input>` tags
3. **Label** - Replaces all form labels
4. **ErrorText** - Replaces error message `<p>` tags
5. **HintText** - Replaces hint text `<p>` tags
6. **Card** - Replaces `bg-white rounded-2xl p-6 border` divs
7. **Avatar** - Replaces avatar circles with initials
8. **IconBox** - Replaces colored icon boxes
9. **StatCard** - Replaces stat cards (icon + label + number)
10. **PageContainer** - Replaces full-page containers
11. **UpdateItem** - Replaces update list items

---

## 🔧 How to Refactor Login.tsx

### Step 1: Add Imports at Top

```tsx
import { Button, Input, Label, ErrorText, HintText, PageContainer } from "../../components/custom";
```

### Step 2: Replace PageContainer (Line 86)

**FIND:**
```tsx
<div className="min-h-screen bg-white flex items-center justify-center p-8">
```

**REPLACE WITH:**
```tsx
<PageContainer>
```

**AND at the end, change the closing `</div>` to `</PageContainer>`**

---

### Step 3: Replace Labels (Lines 96, 117)

**FIND:**
```tsx
<label htmlFor="email" className="block text-sm text-gray-700 mb-2">
	Email
</label>
```

**REPLACE WITH:**
```tsx
<Label htmlFor="email">Email</Label>
```

**Do the same for the password label (line 117)**

---

### Step 4: Replace Inputs (Lines 99, 120)

**FIND:**
```tsx
<input
	type="email"
	id="email"
	placeholder="you@company.com"
	value={email}
	onChange={(e) => setEmail(e.target.value)}
	className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
		errors.email ? "border-red-500" : "border-grey-200"
	}`}
/>
```

**REPLACE WITH:**
```tsx
<Input
	type="email"
	id="email"
	placeholder="you@company.com"
	value={email}
	onChange={(e) => setEmail(e.target.value)}
	hasError={!!errors.email}
/>
```

**Do the same for password input (line 120)**

---

### Step 5: Replace Error Messages (Lines 110, 133)

**FIND:**
```tsx
{errors.email && (
	<p className="text-red-500 text-sm mt-1">{errors.email}</p>
)}
```

**REPLACE WITH:**
```tsx
{errors.email && <ErrorText>{errors.email}</ErrorText>}
```

**Do the same for password error (line 133)**

---

### Step 6: Replace Hint Text (Line 127)

**FIND:**
```tsx
{!errors.password && (
	<p className="text-xs text-gray-400 mt-1.5">At least 8 characters</p>
)}
```

**REPLACE WITH:**
```tsx
{!errors.password && <HintText>At least 8 characters</HintText>}
```

---

### Step 7: Replace Primary Button (Line 138)

**FIND:**
```tsx
<button
	type="submit"
	disabled={isLoading}
	className={`w-full px-6 py-3 text-sm text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors ${
		isLoading
			? "bg-gray-400 cursor-not-allowed"
			: "bg-cyan-600 hover:bg-cyan-700"
	}`}
>
	{isLoading ? "Logging in..." : "Log in"}
</button>
```

**REPLACE WITH:**
```tsx
<Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
	Log in
</Button>
```

---

### Step 8: Replace Text Buttons (Lines 149, 160)

**FIND:**
```tsx
<button
	type="button"
	onClick={() => navigate("/welcome")}
	className="w-full text-sm text-gray-500 hover:text-gray-700"
>
	Forgot password?
</button>
```

**REPLACE WITH:**
```tsx
<Button type="button" variant="text" onClick={() => navigate("/welcome")} className="w-full text-gray-500 hover:text-gray-700">
	Forgot password?
</Button>
```

**FIND (Line 160):**
```tsx
<button
	type="button"
	onClick={() => navigate("/signup")}
	className="text-cyan-600 hover:text-cyan-700"
>
	Sign up
</button>
```

**REPLACE WITH:**
```tsx
<Button type="button" variant="text" onClick={() => navigate("/signup")}>
	Sign up
</Button>
```

---

## 🔧 How to Refactor Dashboard.tsx

### Step 1: Add Imports at Top

```tsx
import { Card, StatCard, UpdateItem } from "../../components/custom";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
```

---

### Step 2: Replace Stat Cards (Lines 41-82)

**FIND (Lines 41-52):**
```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-100">
	<div className="flex items-center gap-3 mb-4">
		<div className="p-2 bg-cyan-100 rounded-xl">
			<Clock className="w-5 h-5 text-cyan-600" />
		</div>
		<span className="text-sm text-gray-500">In Progress</span>
	</div>
	<p className="text-3xl text-gray-900">8</p>
	<p className="text-xs text-gray-400 mt-1">tasks</p>
</div>
```

**REPLACE WITH:**
```tsx
<StatCard
	icon={<Clock className="w-5 h-5 text-cyan-600" />}
	label="In Progress"
	value={8}
	subtitle="tasks"
	bgColor="bg-cyan-100"
/>
```

**Do the same for:**
- **Completed card** (lines 54-67): Use `bgColor="bg-emerald-100"` and icon `<CheckCircle2 className="w-5 h-5 text-emerald-600" />`
- **Blockers card** (lines 69-82): Use `bgColor="bg-rose-100"` and icon `<AlertCircle className="w-5 h-5 text-rose-600" />`

---

### Step 3: Replace Recent Updates Card (Line 85)

**FIND:**
```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-100">
	<h3 className="text-base text-gray-900 mb-4">Recent Updates</h3>
	{/* ... updates list ... */}
</div>
```

**REPLACE WITH:**
```tsx
<Card>
	<h3 className="text-base text-gray-900 mb-4">Recent Updates</h3>
	{/* ... updates list ... */}
</Card>
```

---

### Step 4: Replace UpdateItems (Lines 90-110)

**FIND:**
```tsx
{updates.map((update, index) => (
	<div
		key={index}
		className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
	>
		<div className={`w-10 h-10 rounded-full bg-gradient-to-br ${update.color} flex items-center justify-center flex-shrink-0`}>
			<span className="text-sm text-gray-800">{update.avatar}</span>
		</div>
		<div className="flex-1">
			<div className="flex items-center gap-2 mb-1">
				<span className="text-sm text-gray-900 font-medium">{update.user}</span>
				<span className="text-xs text-gray-400">{update.time}</span>
			</div>
			<p className="text-sm text-gray-600">{update.text}</p>
		</div>
	</div>
))}
```

**REPLACE WITH:**
```tsx
{updates.map((update, index) => (
	<UpdateItem
		key={index}
		user={update.user}
		avatar={update.avatar}
		time={update.time}
		text={update.text}
		color={update.color}
	/>
))}
```

---

### Step 5: Replace Sprint Progress Card (Line 120)

**FIND:**
```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-100">
	{/* ... sprint progress content ... */}
</div>
```

**REPLACE WITH:**
```tsx
<Card>
	{/* ... sprint progress content ... */}
</Card>
```

---

## 🎯 Summary of Changes

### Login.tsx Changes:
- ✅ Replace 1 PageContainer
- ✅ Replace 2 Labels
- ✅ Replace 2 Inputs
- ✅ Replace 2 ErrorText
- ✅ Replace 1 HintText
- ✅ Replace 3 Buttons (1 primary, 2 text)

### Dashboard.tsx Changes:
- ✅ Replace 3 StatCards (In Progress, Completed, Blockers)
- ✅ Replace 2 Cards (Recent Updates, Sprint Progress)
- ✅ Replace 3 UpdateItems (inside Recent Updates)

---

## 📝 Quick Reference: Component Props

### Button (Updated - More Generic!)
```tsx
<Button
  variant="primary" | "secondary" | "text" | "outlined" | "ghost"
  size="sm" | "md" | "lg"
  isLoading={boolean}
  isActive={boolean}  // For toggle buttons
  icon={<Icon />}     // Optional icon
  iconPosition="left" | "right"
  className="..."
>
  Text
</Button>
```

**Real-World Examples:**

```tsx
// 1. Primary submit button with loading
<Button variant="primary" isLoading={isLoading}>
  Log in
</Button>

// 2. Icon + text button (SprintBoard)
<Button variant="ghost" icon={<Plus className="w-4 h-4" />}>
  Add Ticket
</Button>

// 3. Toggle button (priority selector)
<Button variant="outlined" isActive={priority === "high"} onClick={() => setPriority("high")}>
  High
</Button>

// 4. Text-only link button
<Button variant="text">Mark as resolved</Button>

// 5. Secondary outlined button
<Button variant="secondary">Cancel</Button>
```

### Input
```tsx
<Input
  hasError={boolean}
  type="..."
  value={...}
  onChange={...}
  className="..."
/>
```

### StatCard
```tsx
<StatCard
  icon={<Icon className="..." />}
  label="Label text"
  value={number | string}
  subtitle="subtitle text"
  bgColor="bg-cyan-100"
/>
```

### Avatar
```tsx
<Avatar
  initials="AK"
  color="from-emerald-200 to-green-300"
  size="sm" | "md" | "lg"
/>
```

### UpdateItem
```tsx
<UpdateItem
  user="Name"
  avatar="AK"
  time="2h ago"
  text="Message"
  color="from-emerald-200 to-green-300"
/>
```

---

## ✅ After Refactoring

You'll have:
- ✅ **11 custom reusable components**
- ✅ **Consistent design system** (cyan colors, rounded-xl, white cards)
- ✅ **DRY code** (no repeated className strings)
- ✅ **Easy to maintain** (change component = updates everywhere)
- ✅ **Type-safe** (TypeScript props)

**Your code will go from 170 lines to ~60 lines in Login.tsx!** 🎉
