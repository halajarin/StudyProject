-- Script d'insertion des données de test pour EcoRide
-- PostgreSQL

-- Connexion à la base ecoride
\c ecoride

-- Insertion des rôles
INSERT INTO role (role_id, libelle) VALUES
(1, 'Passager'),
(2, 'Chauffeur'),
(3, 'Employe'),
(4, 'Administrateur');

-- Insertion des marques de voitures
INSERT INTO marque (marque_id, libelle) VALUES
(1, 'Renault'),
(2, 'Peugeot'),
(3, 'Citroën'),
(4, 'Tesla'),
(5, 'Volkswagen'),
(6, 'Toyota'),
(7, 'BMW'),
(8, 'Mercedes');

-- Insertion des utilisateurs (mot de passe: Password123!)
-- Hash BCrypt pour Password123!: $2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC
INSERT INTO utilisateur (utilisateur_id, nom, prenom, email, password, telephone, pseudo, credit, est_actif) VALUES
(1, 'Dupont', 'Jean', 'jean.dupont@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0601020304', 'jeandu', 50, TRUE),
(2, 'Martin', 'Marie', 'marie.martin@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0605060708', 'mariema', 30, TRUE),
(3, 'Durand', 'Pierre', 'pierre.durand@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0609101112', 'pierredu', 45, TRUE),
(4, 'Bernard', 'Sophie', 'sophie.bernard@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0613141516', 'sophieb', 25, TRUE),
(5, 'Admin', 'EcoRide', 'admin@ecoride.fr', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0700000000', 'admin', 1000, TRUE),
(6, 'Employe', 'Support', 'support@ecoride.fr', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0700000001', 'support', 0, TRUE);

-- Insertion des rôles utilisateurs
INSERT INTO utilisateur_role (utilisateur_id, role_id) VALUES
-- Jean Dupont: Passager et Chauffeur
(1, 1),
(1, 2),
-- Marie Martin: Passager et Chauffeur
(2, 1),
(2, 2),
-- Pierre Durand: Passager et Chauffeur
(3, 1),
(3, 2),
-- Sophie Bernard: Passager seulement
(4, 1),
-- Admin: Administrateur
(5, 4),
-- Support: Employé
(6, 3);

-- Insertion des voitures
INSERT INTO voiture (voiture_id, modele, immatriculation, energie, couleur, date_premiere_immatriculation, marque_id, utilisateur_id, nombre_places) VALUES
(1, 'Zoé', 'AB-123-CD', 'Electrique', 'Blanc', '2021-03-15', 1, 1, 4),
(2, '308', 'EF-456-GH', 'Diesel', 'Noir', '2020-06-20', 2, 2, 4),
(3, 'Model 3', 'IJ-789-KL', 'Electrique', 'Rouge', '2022-01-10', 4, 3, 4),
(4, 'C3', 'MN-012-OP', 'Essence', 'Bleu', '2019-09-05', 3, 1, 4);

-- Insertion des covoiturages
INSERT INTO covoiturage (covoiturage_id, date_depart, heure_depart, lieu_depart, ville_depart, date_arrivee, heure_arrivee, lieu_arrivee, ville_arrivee, statut, nb_place, nb_place_restante, prix_personne, voiture_id, utilisateur_id, duree_estimee_minutes) VALUES
(1, '2025-12-20', '08:00', 'Gare Montparnasse', 'Paris', '2025-12-20', '12:30', 'Gare Bordeaux Saint-Jean', 'Bordeaux', 'En attente', 3, 2, 35, 1, 1, 270),
(2, '2025-12-21', '14:00', 'Place Bellecour', 'Lyon', '2025-12-21', '18:00', 'Gare de Marseille', 'Marseille', 'En attente', 3, 3, 30, 2, 2, 240),
(3, '2025-12-22', '09:00', 'Centre-ville', 'Lille', '2025-12-22', '14:00', 'Gare Centrale', 'Bruxelles', 'En attente', 3, 3, 25, 3, 3, 300),
(4, '2025-12-23', '07:00', 'Aéroport Charles de Gaulle', 'Paris', '2025-12-23', '10:30', 'Gare de Strasbourg', 'Strasbourg', 'En attente', 3, 1, 40, 4, 1, 210),
(5, '2025-12-18', '10:00', 'Gare de Lyon', 'Paris', '2025-12-18', '13:00', 'Gare Part-Dieu', 'Lyon', 'Terminé', 3, 0, 30, 1, 1, 180);

-- Insertion des participations
INSERT INTO covoiturage_participation (participation_id, covoiturage_id, utilisateur_id, statut, credit_utilise, trajet_valide) VALUES
(1, 1, 4, 'Confirmé', 35, NULL),
(2, 4, 2, 'Confirmé', 40, NULL),
(3, 4, 3, 'Confirmé', 40, NULL),
(4, 5, 2, 'Validé', 30, TRUE),
(5, 5, 3, 'Validé', 30, TRUE),
(6, 5, 4, 'Validé', 30, TRUE);

-- Insertion des avis
INSERT INTO avis (avis_id, commentaire, note, statut, utilisateur_auteur_id, utilisateur_cible_id, covoiturage_id) VALUES
(1, 'Excellent conducteur, très ponctuel et sympathique!', 5, 'Validé', 2, 1, 5),
(2, 'Trajet agréable, bonne ambiance dans la voiture.', 5, 'Validé', 3, 1, 5),
(3, 'Conducteur sympa mais un peu en retard au départ.', 4, 'Validé', 4, 1, 5),
(4, 'Super expérience, je recommande!', 5, 'En attente', 1, 2, NULL);

-- Insertion de configurations
INSERT INTO configuration (id_configuration, libelle, valeur) VALUES
(1, 'Commission plateforme', '2'),
(2, 'Crédit initial', '20'),
(3, 'Email contact', 'contact@ecoride.fr');

INSERT INTO parametre (parametre_id, propriete, valeur, id_configuration) VALUES
(1, 'unite', 'credits', 1),
(2, 'type', 'fixe', 1);

-- Reset des séquences pour éviter les conflits
SELECT setval('role_role_id_seq', (SELECT MAX(role_id) FROM role));
SELECT setval('marque_marque_id_seq', (SELECT MAX(marque_id) FROM marque));
SELECT setval('utilisateur_utilisateur_id_seq', (SELECT MAX(utilisateur_id) FROM utilisateur));
SELECT setval('voiture_voiture_id_seq', (SELECT MAX(voiture_id) FROM voiture));
SELECT setval('covoiturage_covoiturage_id_seq', (SELECT MAX(covoiturage_id) FROM covoiturage));
SELECT setval('covoiturage_participation_participation_id_seq', (SELECT MAX(participation_id) FROM covoiturage_participation));
SELECT setval('avis_avis_id_seq', (SELECT MAX(avis_id) FROM avis));
SELECT setval('configuration_id_configuration_seq', (SELECT MAX(id_configuration) FROM configuration));
SELECT setval('parametre_parametre_id_seq', (SELECT MAX(parametre_id) FROM parametre));

-- Affichage des statistiques
SELECT 'Rôles: ' || COUNT(*) FROM role;
SELECT 'Utilisateurs: ' || COUNT(*) FROM utilisateur;
SELECT 'Marques: ' || COUNT(*) FROM marque;
SELECT 'Voitures: ' || COUNT(*) FROM voiture;
SELECT 'Covoiturages: ' || COUNT(*) FROM covoiturage;
SELECT 'Participations: ' || COUNT(*) FROM covoiturage_participation;
SELECT 'Avis: ' || COUNT(*) FROM avis;

COMMENT ON COLUMN utilisateur.password IS 'Mot de passe hashé avec BCrypt. Mot de passe de test: Password123!';
