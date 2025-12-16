-- EcoRide database creation script
-- PostgreSQL

-- Create database
CREATE DATABASE ecoride
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE ecoride IS 'Database for the EcoRide carpooling application';
