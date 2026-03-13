# EthioSurvey Web Application

EthioSurvey now includes a production-style onboarding flow with:

- Freelancer and company registration
- Secure login/logout
- PostgreSQL-backed profile storage using Supabase

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
- `account_type` (`freelancer` or `company`)
- `phone`
- `company_name`
- `created_at`

## Notes

- If email confirmation is enabled in Supabase Auth, users must confirm before login.
- Company users are required to provide `company_name` at registration.
