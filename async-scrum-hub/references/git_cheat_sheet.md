
## Format: `<type>(<scope>): <description>`
## git commit type
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

## git cheatsheat
| Action                    | Command                       |
| ------------------------- | ----------------------------- |
| Unstage everything        | `git reset / git reset --hard`|
| Unstage one file          | `git reset filename`          |
| Add only specific file(s) | `git add filename1 filename2` |
| Safer add (interactive)   | `git add -p`                  |

## git workflow
git checkout -b merge-branch
git push -u origin merge-branch

#### Start new feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
```
#### Work, commit, push:
```bash
git add .
git commit -m "feat: add my-feature"
git push -u origin feature/my-feature
```
#### Merge feature back into develop:
```bash
git checkout develop
git pull origin develop
git merge feature/my-feature
git push origin develop
```
#### Optionally delete feature branch:
```bash
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```
#### When ready to release:
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```