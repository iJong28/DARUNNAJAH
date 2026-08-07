# Login Multi-Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase email/password login and a protected role-aware dashboard for Kepala Madrasah, Operator, Bendahara, Walikelas, Guru, and Siswa.

**Architecture:** Keep the existing static HTML and ES Module structure. Add a small Supabase client module, shared auth helpers, a login page, and a dashboard page. Store role metadata in `profiles`, enforce profile access with RLS, and use the dashboard only for role-specific presentation; database policies remain the security boundary.

**Tech Stack:** HTML, Tailwind CSS v4 CDN, CSS in `css/styles.css`, browser ES Modules, Supabase JavaScript CDN, Supabase Auth, PostgreSQL/RLS.

## Global Constraints

- Supabase Auth uses email/password.
- The browser must use only the Supabase project URL and anon key; never use a service role key.
- Public registration is disabled in the first stage.
- The six supported role values are `kepala_madrasah`, `operator`, `bendahara`, `walikelas`, `guru`, and `siswa`.
- Role visibility in the dashboard is not a substitute for Supabase RLS.
- Do not add academic, attendance, schedule, payment, or reporting modules in this stage.
- Preserve the existing static-site and ES Module conventions.

## File Map

- Create: `login.html` - email/password login UI.
- Create: `dashboard.html` - guarded role-aware dashboard UI.
- Create: `js/supabase.js` - Supabase client configuration and import.
- Create: `js/auth.js` - session, profile, login, and logout helpers.
- Create: `js/login.js` - login page event handlers.
- Create: `js/dashboard.js` - dashboard guard, profile rendering, role cards, logout.
- Create: `supabase/schema.sql` - profiles table, trigger, enum check, and RLS policies.
- Modify: `css/styles.css` - only shared styles needed by login/dashboard.
- Verify: all new JavaScript files with `node --check` and manually in a browser after Supabase credentials are configured.

### Task 1: Add Supabase Schema and RLS

**Files:**

- Create: `supabase/schema.sql`

**Interfaces:**

- Produces table `public.profiles` with `id`, `full_name`, `role`, `created_at`, and `updated_at`.
- Produces role values `kepala_madrasah`, `operator`, `bendahara`, `walikelas`, `guru`, and `siswa`.
- Produces RLS policies allowing an authenticated user to select only their own profile.

- [ ] **Step 1: Add the SQL schema**

Use this exact schema:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in (
    'kepala_madrasah',
    'operator',
    'bendahara',
    'walikelas',
    'guru',
    'siswa'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
```

- [ ] **Step 2: Run the schema in Supabase SQL Editor**

Run `supabase/schema.sql` in the target Supabase project. Expected: the `profiles` table exists, RLS is enabled, and the select policy is visible under Authentication/Policies.

- [ ] **Step 3: Create initial Auth users and profiles**

Create users from Supabase Authentication > Users with email/password, then insert matching rows in `public.profiles` using the Auth user UUID:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH_USER_UUID', 'Nama Pengguna', 'operator');
```

Replace the UUID, name, and role for each account. Do not expose passwords in repository files.

### Task 2: Add Supabase Client and Auth Helpers

**Files:**

- Create: `js/supabase.js`
- Create: `js/auth.js`

**Interfaces:**

- `supabase.js` exports `supabase`.
- `auth.js` exports `getSession()`, `getCurrentProfile()`, `signIn(email, password)`, and `signOut()`.

- [ ] **Step 1: Add the Supabase client module**

`js/supabase.js` loads the official browser client from the jsDelivr ESM endpoint and exports a client configured from constants:

```js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "PASTE_SUPABASE_URL_HERE";
const supabaseAnonKey = "PASTE_SUPABASE_ANON_KEY_HERE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

The login page must show a configuration error rather than attempt authentication while either placeholder remains unchanged.

- [ ] **Step 2: Add shared auth helpers**

Implement these exact functions:

```js
import { supabase } from "./supabase.js";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", session.user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

- [ ] **Step 3: Run syntax validation**

Run from the repository root:

```powershell
node --check js/supabase.js; node --check js/auth.js
```

Expected: no syntax errors.

### Task 3: Build Login Page

**Files:**

- Create: `login.html`
- Create: `js/login.js`
- Modify: `css/styles.css`

**Interfaces:**

- `login.html` loads `js/login.js` as a module.
- `js/login.js` reads `#login-form`, `#email`, `#password`, `#login-error`, and `#login-submit`.
- Successful login redirects to `dashboard.html`.

- [ ] **Step 1: Add login page markup**

Create a responsive page consistent with the existing green/yellow Darunnajah visual language. Include a labeled email input, labeled password input, show-password button with `aria-label`, submit button, loading text/state, error region with `role="alert"`, and a link back to `index.html`.

- [ ] **Step 2: Add login behavior**

Implement this flow in `js/login.js`:

```js
import { getSession, signIn } from "./auth.js";

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("login-error");
const submitButton = document.getElementById("login-submit");

function setError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.toggle("hidden", !message);
}

async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) window.location.replace("dashboard.html");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError("");
  submitButton.disabled = true;
  submitButton.textContent = "Memproses...";

  try {
    await signIn(form.email.value.trim(), form.password.value);
    window.location.replace("dashboard.html");
  } catch {
    setError("Email atau password tidak valid.");
    submitButton.disabled = false;
    submitButton.textContent = "Masuk";
  }
});

redirectIfAuthenticated().catch(() => {});
```

Add a password visibility toggle and a guard for placeholder Supabase configuration before calling `signIn`.

- [ ] **Step 3: Add focused styles**

Add only login/dashboard utility classes to `css/styles.css`; do not reformat existing styles. Keep controls keyboard accessible and ensure the form remains usable at mobile widths.

- [ ] **Step 4: Run syntax validation**

```powershell
node --check js/login.js
```

Expected: no syntax errors.

### Task 4: Build Guarded Role Dashboard

**Files:**

- Create: `dashboard.html`
- Create: `js/dashboard.js`

**Interfaces:**

- `dashboard.html` loads `js/dashboard.js` as a module.
- `js/dashboard.js` reads `#dashboard-name`, `#dashboard-role`, `#dashboard-menu`, `#dashboard-error`, and `#logout-button`.
- The page redirects unauthenticated users to `login.html`.

- [ ] **Step 1: Add dashboard markup**

Create a responsive dashboard with navbar/logo, user identity area, logout button, error region, and an empty menu container. Use six role cards defined by JavaScript so there is one rendering source for labels and descriptions.

- [ ] **Step 2: Add dashboard guard and role rendering**

Implement a `roleContent` map keyed by the six exact role strings. On load, call `getCurrentProfile()`. If it returns `null`, redirect to `login.html`; otherwise render `full_name`, a human-readable role label, and only the cards for that role. Unknown roles show an error and do not render privileged menu content.

- [ ] **Step 3: Add logout behavior**

Call `signOut()` on `#logout-button`, then replace the current location with `login.html`. Disable the button while the request is active and show an error if logout fails.

- [ ] **Step 4: Run syntax validation**

```powershell
node --check js/dashboard.js
```

Expected: no syntax errors.

### Task 5: Verify End-to-End Behavior

**Files:**

- Verify: `login.html`, `dashboard.html`, `js/*.js`, `supabase/schema.sql`

- [ ] **Step 1: Configure Supabase credentials locally**

Replace the two placeholders in `js/supabase.js` with the target project's URL and anon key. Do not use or commit a service role key.

- [ ] **Step 2: Test unauthenticated guard**

Open `dashboard.html` in a browser without an active session. Expected: it redirects to `login.html`.

- [ ] **Step 3: Test invalid login**

Submit an incorrect email/password pair. Expected: the form remains on `login.html`, shows `Email atau password tidak valid.`, and re-enables the button.

- [ ] **Step 4: Test each role**

Log in with one test account for each role. Expected: the dashboard displays the user's name, correct role label, and only the corresponding role menu.

- [ ] **Step 5: Test logout**

Click logout, then open `dashboard.html` again. Expected: the page redirects to `login.html`.

- [ ] **Step 6: Check all JavaScript files**

```powershell
Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Expected: every JavaScript file passes syntax validation.

- [ ] **Step 7: Review the diff**

```powershell
git diff --check; git status --short
```

Expected: no whitespace errors; only the planned login/dashboard/schema/style files are changed or added.
