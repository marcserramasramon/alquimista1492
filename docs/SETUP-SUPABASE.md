# 🚀 Setup Supabase

Instructions for configuring Supabase and running migrations.

## Prerequisites

- npm installed
- Supabase CLI: `npm install -D supabase`
- Supabase account (supabase.com)

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note down:
   - Project URL: `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key: `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Update Environment Variables

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Link Local Project to Supabase

```bash
npx supabase link --project-ref your-project-ref
```

This will prompt for your access token. Generate one at:
https://app.supabase.com/account/tokens

## Step 4: Apply Migrations

```bash
npx supabase db push
```

This applies all SQL migrations from `supabase/migrations/` to your Supabase database.

## Step 5: Generate TypeScript Types

```bash
npx supabase gen types typescript --local > lib/db.types.ts
```

This generates TypeScript types from your database schema.

## Step 6: Verify Setup

Test that everything is working:

```bash
npm run dev
```

Visit `http://localhost:3000` and verify no TypeScript errors.

### Manual Database Tests

In Supabase console (SQL Editor):

**Test 1: Create test team**
```sql
INSERT INTO teams (code, variant, name)
VALUES ('TEST01', 'A', 'Test Team')
RETURNING *;
```

**Test 2: Verify RLS on solutions_private**
```sql
-- This should return data (service role)
SELECT * FROM solutions_private LIMIT 1;

-- But players cannot see it (test in client with anon key)
-- If you can see this query, RLS is NOT enabled - check settings
```

**Test 3: Test player auth**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"teamCode": "TEST01", "playerName": "Test Player"}'
```

Expected response:
```json
{
  "sessionId": "...",
  "teamId": "...",
  "playerId": "..."
}
```

**Test 4: Test master auth**
```bash
curl -X POST http://localhost:3000/api/auth/master \
  -H "Content-Type: application/json" \
  -d '{"pin": "123456"}'
```

Expected response:
```json
{
  "token": "eyJhbGc..."
}
```

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is required"

Make sure `.env.local` exists and has all required variables.

### "Database connection failed"

- Check Supabase project is running (not paused)
- Verify credentials are correct
- Check internet connection

### "RLS policy violation"

This is expected! It means RLS is working. The `solutions_private` table should only be accessible to the server (service_role).

### "supabase link failed"

Generate a new access token at https://app.supabase.com/account/tokens

## Next Steps

Once Supabase is configured:
1. ✅ Phase 1 complete
2. → Agents B, C, D can now start their phases
3. → Create PHASE-STATUS.json update

## References

- Supabase Docs: https://supabase.com/docs
- Next.js + Supabase: https://supabase.com/docs/guides/with-nextjs
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
