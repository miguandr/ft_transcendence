# Standup Bugs

## Bug 1 — Edit window uses server timezone (UTC), not local time

**Problem:** Standups should be editable until 23:59 of the day they were created (local time). Currently the edit window closes at 02:00 local time if the user is in UTC+2, because the comparison uses UTC.

**Root cause:** `canEditStandup` compares `created_at` (a UTC timestamp) against `today` computed with `.toISOString()` (also UTC). For a user in UTC+2, UTC midnight is 02:00 local — so the edit button disappears 2 hours too early.

**Fix:** The backend already stores `standup_date` (the calendar date the server assigned at creation time). Add it to the `StandupResponse` schema and expose it via the list endpoint. On the frontend, replace the `created_at` string comparison with `standup.standup_date === today` where `today` is the local calendar date.

---

## Bug 2 — 401 Unauthorized does not redirect to login

**Problem:** When the JWT token expires (happens at midnight), API calls return `401 Unauthorized`. Instead of redirecting to the login page, the app shows an error message and gets stuck.

**Fix:** In every handler that calls the API, catch the `UNAUTHORIZED` or `INVALID_TOKEN` error code and call `await refreshUser()`. This clears the session and `RequireAuth` automatically redirects to `/login`.

Apply this to every page that has API handlers. Example from Standups:

### `handleCreateStandup`

```typescript
const handleCreateStandup = async () => {
    if (!orgId) return;
    setIsPosting(true);

    try {
        await createStandup(orgId!, { today: standupForm.today });
        await fetchStandups();
        setIsCreateStandupOpen(false);
        setStandupForm({ today: "" });
    } catch (error: unknown) {
        console.error("API call failed:", error);

        const apiError = error as APIError;
        if (Array.isArray(apiError.detail) && apiError.detail.length > 0) {
            setErrors({ createStandup: apiError.detail[0]?.msg ?? "Validation error" });
        } else if (apiError.detail?.error?.code === "UNAUTHORIZED" || apiError.detail?.error?.code === "INVALID_TOKEN") {
            await refreshUser();
        } else if (apiError.detail?.error?.code === "FORBIDDEN") {
            setErrors({ createStandup: "You do not have permission to perform this action" });
        } else if (apiError.detail?.error?.code === "NOT_FOUND") {
            setErrors({ createStandup: "Organization not found" });
        } else {
            setErrors({ createStandup: "Something went wrong" });
        }
    } finally {
        setIsPosting(false);
    }
};
```

### `handleEditStandup`

```typescript
const handleEditStandup = async () => {
    setIsSaving(true);
    try {
        if (editingStandup) {
            await editStandup(editingStandup.id, { today: standupForm.today });
        }
        await fetchStandups();
        setIsEditStandupOpen(false);
        setEditingStandup(null);
        setStandupForm({ today: "" });
    } catch (error: unknown) {
        console.error("API call failed:", error);

        const apiError = error as APIError;
        if (Array.isArray(apiError.detail) && apiError.detail.length > 0) {
            setErrors({ editStandup: apiError.detail[0]?.msg ?? "Validation error" });
        } else if (apiError.detail?.error?.code === "UNAUTHORIZED" || apiError.detail?.error?.code === "INVALID_TOKEN") {
            await refreshUser();
        } else if (apiError.detail?.error?.code === "FORBIDDEN") {
            setErrors({ editStandup: "You do not have permission to perform this action" });
        } else if (apiError.detail?.error?.code === "EDIT_WINDOW_EXPIRED") {
            setErrors({ editStandup: "Standups can only be edited on the day they are created" });
        } else {
            setErrors({ editStandup: "Something went wrong" });
        }
    } finally {
        setIsSaving(false);
    }
};
```

### `handleDeleteStandup`

```typescript
const handleDeleteStandup = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);

    try {
        await deleteStandup(confirmDelete);
        await fetchStandups();
        setConfirmDelete(null);
    } catch (error: unknown) {
        console.error("API call failed:", error);

        const apiError = error as APIError;
        if (apiError.detail?.error?.code === "UNAUTHORIZED" || apiError.detail?.error?.code === "INVALID_TOKEN") {
            await refreshUser();
        } else if (apiError.detail?.error?.code === "FORBIDDEN") {
            setErrors({ deleteStandup: "You do not have permission to perform this action" });
        } else if (apiError.detail?.error?.code === "NOT_FOUND") {
            setErrors({ deleteStandup: "Standup not found" });
        } else {
            setErrors({ deleteStandup: "Something went wrong" });
        }
    } finally {
        setIsDeleting(false);
    }
};
```

> **Note:** `refreshUser` must be destructured from `useAuth()`:
> ```typescript
> const { user: authUser, refreshUser } = useAuth();
> ```

