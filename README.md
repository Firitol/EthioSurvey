# EthioSurvey Web Application

EthioSurvey now includes production-ready role-based onboarding with:

- Registration as **freelancer**, **employee**, or **company**
- Secure login/logout with Supabase Auth
- Role-specific dashboards:
  - `workers-dashboard.html` (freelancers + employees)
  - `companies-dashboard.html` (companies)
- `questionnaire-dashboard.html` for starting paid feedback tasks

## Tech stack

- Vite + vanilla JS frontend
- Supabase Auth for authentication
- PostgreSQL (Supabase) for profile data

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

3. Create the PostgreSQL profile table:

- Open Supabase SQL editor
- Run the script in `db/create_profiles_table.sql`

4. Start the app:

```bash
npm run dev
```

## Database schema

The app writes account details into `public.profiles`:

- `id` (UUID, linked to `auth.users.id`)
- `full_name`
- `email`
- `account_type` (`freelancer`, `employee`, or `company`)
- `phone`
- `company_name`
- `created_at`

## Notes

- Company users are required to provide `company_name` during registration.
- Workers and companies are redirected to separate dashboards after login.


## If your branch has complex merge conflicts

If conflict resolution is blocking deployment, you can apply this branch directly:

```bash
git fetch origin
# from your destination branch
git checkout <your-branch>
git checkout work -- .
git commit -m "Apply EthioSurvey auth/dashboard update from work branch"
git push
```

Then run:

```bash
npm install
npm run build
```
