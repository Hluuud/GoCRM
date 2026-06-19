-- NexCRM PostgreSQL Init Script
-- Runs once when the container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- trigram indexes for fast text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create application user with limited privileges
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'nexcrm_app') THEN
    CREATE ROLE nexcrm_app WITH LOGIN PASSWORD 'nexcrm_app_secret';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE nexcrm_dev TO nexcrm_app;
GRANT USAGE ON SCHEMA public TO nexcrm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nexcrm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nexcrm_app;

-- Performance tuning (dev defaults)
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET max_connections = 200;

SELECT pg_reload_conf();
