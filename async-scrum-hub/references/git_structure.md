## 1. Branching & Git Rules

## Branches
- `main` → protected, demo-ready only
- `dev` → integration branch
- `feat/<short-name>` → feature work (e.g. `feat/standups-ui`)

## Rules
- No direct commits to `main`
- All work goes through a Pull Request (PR) into `dev`
- `dev` → `main` merges only at milestone checkpoints

## Git workflow
main
 └─ create feature branch
     └─ write code
         └─ commit changes
             └─ open pull request
                 ├─ review + discussion
                 ├─ fixes (if needed)
                 └─ merge into main


## 📝 Commit Messages

### Format: `<type>(<scope>): <description>`
| Type       | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| `feat`     | New feature                                           |
| `fix`      | Bug fix                                               |
| `docs`     | Documentation only                                    |
| `style`    | Code style changes (whitespace, formatting, no logic) |
| `refactor` | Refactoring code (no new features, no bugfixes)       |
| `test`     | Adding or changing tests                              |
| `chore`    | Other tasks (build system, dependencies, etc.)        |
| `WIP`      | Work in Progress  |


**Scope:**
- Component/module name
- Examples: `auth`, `button`, `api`, `database`

**Description:**
- Imperative mood (not past tense)
- Lowercase
- No period at end
- Max 72 characters

### ✅ GOOD Commits:

```bash
git commit -m "feat(auth): add login endpoint with JWT generation"
git commit -m "feat(button): add hover and active states"
git commit -m "fix(validation): handle edge case in email validator"
git commit -m "docs(api): add examples to auth endpoints"
git commit -m "refactor(auth): extract password hashing to utility"
git commit -m "test(auth): add unit tests for login service"
git commit -m "chore(deps): update dependencies to latest versions"
```

### ❌ BAD Commits:

```bash
git commit -m "stuff"                    # ❌ Not descriptive
git commit -m "Fixed bug"                # ❌ What bug? Where?
git commit -m "Updated files"            # ❌ Which files? Why?
git commit -m "WIP"                      # ❌ Don't commit WIP
git commit -m "Added login page."        # ❌ Has period, past tense
git commit -m "feat: everything"         # ❌ Too broad
```

### Atomic Commits

**Each commit should be:**
- One logical change
- Independently testable
- Easily revertable
- Descriptive enough to understand without reading code

**Example of breaking work into atomic commits:**
```bash
# ❌ BAD: One huge commit
git commit -m "feat(auth): complete auth system"

# ✅ GOOD: Multiple atomic commits
git commit -m "feat(auth): add User model to Prisma schema"
git commit -m "feat(auth): implement password hashing utility"
git commit -m "feat(auth): add JWT generation and verification"
git commit -m "feat(auth): create register endpoint"
git commit -m "feat(auth): create login endpoint"
git commit -m "feat(auth): add auth middleware for protected routes"
git commit -m "test(auth): add unit tests for auth service"
```

**Benefits:**
- Easy to review (small PRs)
- Easy to debug (bisect to find breaking commit)
- Easy to rollback (revert specific change)
- Clear project history
## Branch Strategy

```
main (production-ready, protected)
 └── dev (integration branch)
      ├── feat/auth-login          
      ├── feat/design-system       
      ├── feat/sprint-backend      
      └── feat/websocket-setup     
```