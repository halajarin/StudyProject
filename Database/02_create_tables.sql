-- Script de création des tables pour EcoRide
-- PostgreSQL

-- Connexion à la base ecoride
\c ecoride

-- Table configuration
CREATE TABLE configuration (
    id_configuration SERIAL PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    valeur VARCHAR(255) NOT NULL,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table parametre
CREATE TABLE parametre (
    parametre_id SERIAL PRIMARY KEY,
    propriete VARCHAR(50) NOT NULL,
    valeur VARCHAR(50) NOT NULL,
    id_configuration INTEGER NOT NULL,
    FOREIGN KEY (id_configuration) REFERENCES configuration(id_configuration) ON DELETE CASCADE
);

-- Table role
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

-- Table utilisateur
CREATE TABLE utilisateur (
    utilisateur_id SERIAL PRIMARY KEY,
    nom VARCHAR(80) NOT NULL,
    prenom VARCHAR(80) NOT NULL,
    email VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(80) NOT NULL,
    telephone VARCHAR(80),
    adresse VARCHAR(80),
    date_naissance DATE,
    photo BYTEA,
    pseudo VARCHAR(80) NOT NULL UNIQUE,
    credit INTEGER DEFAULT 20,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE
);

-- Table utilisateur_role (table d'association)
CREATE TABLE utilisateur_role (
    utilisateur_role_id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    UNIQUE(utilisateur_id, role_id)
);

-- Table marque
CREATE TABLE marque (
    marque_id SERIAL PRIMARY KEY,
    libelle VARCHAR(80) NOT NULL
);

-- Table voiture
CREATE TABLE voiture (
    voiture_id SERIAL PRIMARY KEY,
    modele VARCHAR(80) NOT NULL,
    immatriculation VARCHAR(80) NOT NULL UNIQUE,
    energie VARCHAR(80) NOT NULL,
    couleur VARCHAR(80) NOT NULL,
    date_premiere_immatriculation DATE,
    marque_id INTEGER NOT NULL,
    utilisateur_id INTEGER NOT NULL,
    nombre_places INTEGER NOT NULL,
    FOREIGN KEY (marque_id) REFERENCES marque(marque_id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE
);

-- Table covoiturage
CREATE TABLE covoiturage (
    covoiturage_id SERIAL PRIMARY KEY,
    date_depart DATE NOT NULL,
    heure_depart VARCHAR(80) NOT NULL,
    lieu_depart VARCHAR(80) NOT NULL,
    ville_depart VARCHAR(100) NOT NULL,
    date_arrivee DATE NOT NULL,
    heure_arrivee VARCHAR(80) NOT NULL,
    lieu_arrivee VARCHAR(80) NOT NULL,
    ville_arrivee VARCHAR(100) NOT NULL,
    statut VARCHAR(80) DEFAULT 'En attente',
    nb_place INTEGER NOT NULL,
    nb_place_restante INTEGER NOT NULL,
    prix_personne FLOAT NOT NULL,
    voiture_id INTEGER NOT NULL,
    utilisateur_id INTEGER NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duree_estimee_minutes INTEGER,
    FOREIGN KEY (voiture_id) REFERENCES voiture(voiture_id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE RESTRICT
);

-- Table covoiturage_participation
CREATE TABLE covoiturage_participation (
    participation_id SERIAL PRIMARY KEY,
    covoiturage_id INTEGER NOT NULL,
    utilisateur_id INTEGER NOT NULL,
    date_participation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'Confirmé',
    credit_utilise INTEGER NOT NULL,
    trajet_valide BOOLEAN,
    commentaire_probleme TEXT,
    FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(covoiturage_id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
    UNIQUE(covoiturage_id, utilisateur_id)
);

-- Table avis
CREATE TABLE avis (
    avis_id SERIAL PRIMARY KEY,
    commentaire VARCHAR(500) NOT NULL,
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    statut VARCHAR(80) DEFAULT 'En attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_auteur_id INTEGER NOT NULL,
    utilisateur_cible_id INTEGER NOT NULL,
    covoiturage_id INTEGER,
    FOREIGN KEY (utilisateur_auteur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_cible_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
    FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(covoiturage_id) ON DELETE SET NULL
);

-- Création des index pour améliorer les performances
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_pseudo ON utilisateur(pseudo);
CREATE INDEX idx_covoiturage_ville ON covoiturage(ville_depart, ville_arrivee, date_depart);
CREATE INDEX idx_voiture_immatriculation ON voiture(immatriculation);
CREATE INDEX idx_avis_cible ON avis(utilisateur_cible_id, statut);
CREATE INDEX idx_participation_user ON covoiturage_participation(utilisateur_id);
CREATE INDEX idx_participation_covoiturage ON covoiturage_participation(covoiturage_id);

COMMENT ON TABLE utilisateur IS 'Table des utilisateurs de la plateforme EcoRide';
COMMENT ON TABLE covoiturage IS 'Table des trajets de covoiturage proposés';
COMMENT ON TABLE covoiturage_participation IS 'Table des participations aux covoiturages';
COMMENT ON TABLE avis IS 'Table des avis laissés par les utilisateurs';
