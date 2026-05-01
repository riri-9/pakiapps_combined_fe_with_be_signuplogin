-- Supabase Data API exposure and grants for the mobile auth table.
-- Apply this migration in Supabase SQL editor if signup/login returns:
-- "Invalid schema: public" or the profile row cannot be written/read.

-- Keep the default API schema on public so PostgREST can resolve USER_FACT_TABLE.
ALTER ROLE authenticator SET pgrst.db_schemas = 'public';

-- Make sure the API roles can use the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table access for the auth/profile flow.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."USER_FACT_TABLE"
TO anon, authenticated, service_role;

-- Ensure future public tables created by migrations can be reached from the API.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
TO anon, authenticated, service_role;

