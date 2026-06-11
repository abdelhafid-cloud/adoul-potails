-- Crée l'utilisateur et la base Adoul AI (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'adoul') THEN
        CREATE ROLE adoul WITH LOGIN PASSWORD 'adoul_secret';
    ELSE
        ALTER ROLE adoul WITH PASSWORD 'adoul_secret';
    END IF;
END
$$;

SELECT 'CREATE DATABASE adoul_ai OWNER adoul ENCODING ''UTF8'''
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'adoul_ai')\gexec

GRANT ALL PRIVILEGES ON DATABASE adoul_ai TO adoul;
