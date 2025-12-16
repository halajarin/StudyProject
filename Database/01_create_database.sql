-- Script de création de la base de données EcoRide
-- PostgreSQL

-- Création de la base de données
CREATE DATABASE ecoride
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE ecoride IS 'Base de données pour l''application de covoiturage EcoRide';
