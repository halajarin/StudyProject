# Manuel Utilisateur - EcoRide

## Version 1.0 - Janvier 2026

---

## Table des matières

1. [Présentation de l'application](#1-présentation-de-lapplication)
2. [Accès à l'application](#2-accès-à-lapplication)
3. [Créer un compte](#3-créer-un-compte)
4. [Se connecter](#4-se-connecter)
5. [Rechercher un covoiturage](#5-rechercher-un-covoiturage)
6. [Participer à un covoiturage](#6-participer-à-un-covoiturage)
7. [Proposer un covoiturage](#7-proposer-un-covoiturage)
8. [Gérer mes trajets](#8-gérer-mes-trajets)
9. [Laisser un avis](#9-laisser-un-avis)
10. [Système de crédits](#10-système-de-crédits)
11. [Espace Employé](#11-espace-employé)
12. [Espace Administrateur](#12-espace-administrateur)
13. [Comptes de test](#13-comptes-de-test)
14. [Dépannage](#14-dépannage)

---

## 1. Présentation de l'application

**EcoRide** est une plateforme de covoiturage écologique qui permet aux utilisateurs de :
- 🚗 Proposer des trajets en tant que conducteur
- 🧑‍🤝‍🧑 Participer à des trajets en tant que passager
- 💳 Utiliser un système de crédits interne (pas d'argent réel)
- ⭐ Évaluer les conducteurs et passagers
- 🌱 Privilégier les véhicules écologiques

### Particularités
- **Système de crédits** : Chaque nouvel utilisateur reçoit 20 crédits gratuits
- **Commission plateforme** : 2 crédits prélevés lors de la création d'un trajet
- **Validation des avis** : Les avis sont modérés par des employés avant publication
- **Trajets validés** : Le conducteur doit valider la fin du trajet pour que les passagers puissent laisser un avis

### Technologies utilisées
- **Frontend** : Angular 20 (interface moderne et réactive)
- **Backend** : .NET 9 (API REST sécurisée)
- **Base de données** : PostgreSQL + MongoDB
- **Sécurité** : JWT (JSON Web Tokens) + BCrypt

---

## 2. Accès à l'application

### URL de l'application
- **Production** : [https://ecoride.example.com](https://ecoride.example.com) *(à remplacer par l'URL réelle après déploiement)*
- **Développement local** : http://localhost:4200

### Configuration requise
- Navigateur moderne (Chrome, Firefox, Edge, Safari)
- Connexion Internet
- JavaScript activé

---

## 3. Créer un compte

### Étapes d'inscription

1. **Accéder à la page d'inscription**
   - Cliquer sur "S'inscrire" dans la barre de navigation
   - Ou accéder directement à `/register`

2. **Remplir le formulaire**
   - **Nom d'utilisateur** : 3 à 50 caractères
   - **Email** : Adresse email valide (utilisée pour la connexion)
   - **Mot de passe** : Minimum 8 caractères
   - **Confirmation du mot de passe** : Doit correspondre au mot de passe

3. **Validation**
   - Cliquer sur "S'inscrire"
   - Vous recevez automatiquement **20 crédits** de bienvenue
   - Vous êtes redirigé vers la page d'accueil, connecté automatiquement

### Rôles attribués
- Par défaut, chaque nouvel utilisateur a le rôle **Passager**
- Pour devenir **Conducteur**, vous devez ajouter un véhicule dans votre profil
- Les rôles **Employé** et **Administrateur** sont attribués manuellement

---

## 4. Se connecter

### Connexion standard

1. Cliquer sur "Se connecter" dans la barre de navigation
2. Saisir votre **email** et **mot de passe**
3. Cliquer sur "Connexion"
4. Vous êtes redirigé vers la page d'accueil

### Déconnexion

- Cliquer sur votre nom d'utilisateur dans la barre de navigation
- Sélectionner "Se déconnecter"

---

## 5. Rechercher un covoiturage

### Accès à la recherche

- Page d'accueil : Barre de recherche principale
- Menu : "Rechercher un covoiturage"

### Critères de recherche

**Critères obligatoires** :
- **Ville de départ** : Exemple "Paris"
- **Ville d'arrivée** : Exemple "Lyon"
- **Date de départ** : Format JJ/MM/AAAA

**Filtres optionnels** :
- **Prix maximum** : Filtrer par prix (en crédits)
- **Durée maximale** : Filtrer par durée du trajet
- **Type de véhicule écologique** : Électrique, Hybride, GNV
- **Note minimale du conducteur** : Filtrer par note (1 à 5 étoiles)

### Résultats de recherche

Chaque résultat affiche :
- Ville de départ et d'arrivée
- Date et heure de départ
- Prix par personne (en crédits)
- Places disponibles
- Informations sur le conducteur :
  - Nom d'utilisateur
  - Note moyenne (⭐)
  - Nombre d'avis
- Informations sur le véhicule :
  - Modèle
  - Type d'énergie
  - Consommation

### Consulter les détails

Cliquer sur "Voir détails" pour accéder à la page détaillée du covoiturage.

---

## 6. Participer à un covoiturage

### Prérequis
- Être connecté
- Avoir suffisamment de crédits (≥ prix du trajet)
- Places disponibles
- Ne pas être le conducteur du trajet

### Étapes de participation

1. **Consulter le détail du covoiturage**
   - Vérifier les informations (date, heure, prix)
   - Lire les avis du conducteur
   - Vérifier les préférences (musique, animaux, bagages)

2. **Cliquer sur "Participer"**
   - Un message de confirmation apparaît
   - Les crédits sont immédiatement débités de votre compte
   - Vous recevez une notification par email

3. **Confirmation**
   - Le trajet apparaît dans "Mes trajets" > "En tant que passager"
   - Les places disponibles sont mises à jour

### Annulation de participation

- Accéder à "Mon profil" > "Mes trajets"
- Cliquer sur "Annuler ma participation"
- **Remboursement** : Les crédits sont intégralement remboursés
- **Restriction** : Impossible d'annuler après le départ du trajet

---

## 7. Proposer un covoiturage

### Prérequis
- Être connecté
- Avoir au moins **2 crédits** (commission plateforme)
- Avoir enregistré un véhicule dans votre profil

### Ajouter un véhicule (première fois)

1. Accéder à "Mon profil"
2. Section "Mes véhicules"
3. Remplir le formulaire :
   - **Modèle** : Exemple "Tesla Model 3"
   - **Immatriculation** : Format AA-123-BB
   - **Nombre de places** : 2 à 8 places
   - **Type d'énergie** : Électrique, Essence, Diesel, Hybride, GNV
   - **Consommation** : L/100km ou kWh/100km
4. Cliquer sur "Ajouter le véhicule"

**Note** : L'ajout d'un véhicule vous attribue automatiquement le rôle **Conducteur**.

### Créer un covoiturage

1. **Accéder au formulaire**
   - Menu : "Proposer un trajet"
   - Ou "Mon profil" > "Créer un trajet"

2. **Remplir les informations du trajet**
   - **Ville de départ** : Exemple "Paris"
   - **Ville d'arrivée** : Exemple "Lyon"
   - **Date de départ** : Sélectionner dans le calendrier
   - **Heure de départ** : Format HH:MM
   - **Prix par personne** : En crédits (exemple : 25)
   - **Nombre de places** : Maximum = places du véhicule
   - **Véhicule** : Sélectionner dans la liste de vos véhicules

3. **Soumettre**
   - Cliquer sur "Créer le covoiturage"
   - **2 crédits** sont prélevés comme commission
   - Le trajet apparaît immédiatement dans les résultats de recherche

### Gains pour le conducteur

- **À chaque participation** : Vous recevez le prix par personne en crédits
- **Exemple** : Prix 25 crédits, 3 passagers = 75 crédits gagnés
- Les crédits sont versés immédiatement lors de la participation

---

## 8. Gérer mes trajets

### Accès à "Mes trajets"

- Menu : "Mon profil"
- Section "Mes trajets"

### En tant que conducteur

**Statuts possibles** :
- **En attente** : Trajet créé, aucun passager ou pas encore démarré
- **En cours** : Trajet démarré
- **Terminé** : Trajet validé comme terminé
- **Annulé** : Trajet annulé

**Actions disponibles** :
- **Démarrer le trajet** : Marquer le début du trajet
- **Terminer le trajet** : Marquer la fin (envoie un email aux passagers)
- **Annuler le trajet** : Rembourse automatiquement tous les passagers

### En tant que passager

**Informations affichées** :
- Détails du trajet (départ, arrivée, date, heure)
- Informations du conducteur
- Prix payé
- Statut du trajet

**Actions disponibles** :
- **Annuler ma participation** : Avant le départ uniquement
- **Laisser un avis** : Après validation du trajet par le conducteur

---

## 9. Laisser un avis

### Conditions pour évaluer

- Le trajet doit avoir le statut **Terminé**
- Le conducteur doit avoir validé la fin du trajet
- Vous devez avoir participé au trajet
- Vous ne pouvez laisser qu'**un seul avis par trajet**

### Processus d'évaluation

1. **Accéder au formulaire**
   - "Mon profil" > "Mes trajets" > "En tant que passager"
   - Cliquer sur "⭐ Laisser un avis" sous le trajet terminé

2. **Remplir l'avis**
   - **Note** : Sélectionner de 1 à 5 étoiles
     - ⭐ = Très mauvais
     - ⭐⭐ = Mauvais
     - ⭐⭐⭐ = Moyen
     - ⭐⭐⭐⭐ = Bon
     - ⭐⭐⭐⭐⭐ = Excellent
   - **Commentaire** : 10 à 500 caractères
     - Soyez constructif et respectueux
     - Décrivez votre expérience

3. **Soumettre**
   - Cliquer sur "Soumettre"
   - Message de confirmation : "Avis soumis avec succès ! Il sera visible après validation par un employé."

### Modération des avis

- Tous les avis passent par une **validation manuelle**
- Un employé vérifie le contenu (pas d'insultes, spam, etc.)
- Statuts :
  - **En attente** : En cours de modération
  - **Validé** : Publié et visible, compte dans la moyenne
  - **Rejeté** : Refusé (contenu inapproprié)

### Consulter les avis reçus

- "Mon profil" > Section "Mes avis reçus"
- Affichage de tous les avis **validés**
- Note moyenne affichée dans votre profil

---

## 10. Système de crédits

### Fonctionnement général

EcoRide utilise une **monnaie virtuelle interne** : les crédits.

**1 crédit = 1 unité de valeur** (pas de conversion en argent réel)

### Obtenir des crédits

| Action | Crédits |
|--------|---------|
| Inscription | +20 crédits |
| Quelqu'un participe à votre trajet | +Prix du trajet |
| Annulation de participation (passager) | +Remboursement du prix |

### Dépenser des crédits

| Action | Crédits |
|--------|---------|
| Créer un covoiturage | -2 crédits (commission) |
| Participer à un covoiturage | -Prix du trajet |

### Consulter son solde

- Barre de navigation : Votre solde s'affiche en permanence
- "Mon profil" : Affichage détaillé du solde

### Que faire si je n'ai plus de crédits ?

Si votre solde est insuffisant :
- **Solution 1** : Proposer des trajets en tant que conducteur
- **Solution 2** : Attendre qu'un de vos trajets proposés soit réservé
- **Note** : Il n'est pas possible d'acheter des crédits (système fermé)

---

## 11. Espace Employé

### Accès

**Réservé aux utilisateurs avec le rôle "Employé"** ou "Administrateur"

Menu : "Espace Employé" (visible uniquement si vous avez le rôle)

### Modération des avis

#### Voir les avis en attente

- Section "Avis en attente de validation"
- Liste de tous les avis avec statut "Pending"
- Affichage :
  - Note (étoiles)
  - Commentaire
  - Auteur de l'avis
  - Utilisateur évalué
  - Date de création

#### Valider un avis

1. Lire le commentaire
2. Vérifier qu'il respecte les règles :
   - Pas d'insultes
   - Pas de contenu inapproprié
   - En rapport avec le trajet
3. Cliquer sur "✅ Valider"
4. L'avis devient visible et compte dans la moyenne du conducteur

#### Rejeter un avis

1. Identifier un avis inapproprié
2. Cliquer sur "❌ Rejeter"
3. L'avis est supprimé et ne sera jamais affiché

### Problèmes signalés

- Section "Problèmes signalés"
- Visualisation des incidents remontés par les utilisateurs
- *(Fonctionnalité en développement)*

---

## 12. Espace Administrateur

### Accès

**Réservé aux utilisateurs avec le rôle "Administrateur"**

Menu : "Tableau de bord Admin" (visible uniquement si vous avez le rôle)

### Fonctionnalités

#### Statistiques globales

- **Total utilisateurs** : Nombre d'inscrits
- **Total covoiturages** : Nombre de trajets créés
- **Total participations** : Nombre de réservations
- **Crédits en circulation** : Somme de tous les crédits des utilisateurs

#### Graphiques (en développement)

- Covoiturages créés par jour
- Crédits échangés par jour
- Évolution du nombre d'utilisateurs

#### Gestion des utilisateurs

- Liste de tous les utilisateurs
- Possibilité de modifier les rôles
- Consultation des profils

#### Gestion des covoiturages

- Liste de tous les covoiturages (tous statuts)
- Statistiques détaillées
- Modération si nécessaire

---

## 13. Comptes de test

### Compte Administrateur

```
Email    : admin@ecoride.fr
Password : Password123!
Rôles    : Administrateur, Employé, Conducteur, Passager
Crédits  : 1000
```

**Capacités** :
- Accès à tous les espaces
- Modération des avis
- Tableau de bord admin
- Peut proposer et participer à des covoiturages

### Compte Conducteur

```
Email    : jean.dupont@ecoride.fr
Password : Password123!
Rôles    : Conducteur, Passager
Crédits  : 500
Véhicule : Tesla Model 3 (Électrique)
```

**Capacités** :
- Proposer des trajets
- Participer à des trajets
- Note moyenne : 4.5⭐ (2 avis validés)

### Compte Passager

```
Email    : halajarin@ecoride.fr
Password : Password123!
Rôles    : Passager
Crédits  : 100
```

**Capacités** :
- Rechercher des covoiturages
- Participer à des trajets
- Laisser des avis

---

## 14. Dépannage

### Je ne peux pas me connecter

**Vérifications** :
1. Email correct (pas le nom d'utilisateur)
2. Mot de passe exact (sensible à la casse)
3. Compte bien créé (vérifier les emails de confirmation)

**Solution** : Si oublié, contacter un administrateur pour réinitialiser

### Je ne peux pas participer à un covoiturage

**Causes possibles** :
- ❌ Vous êtes le conducteur du trajet
- ❌ Solde insuffisant
- ❌ Plus de places disponibles
- ❌ Vous participez déjà à ce trajet

**Solution** : Vérifier votre solde dans "Mon profil"

### Je ne peux pas créer de covoiturage

**Causes possibles** :
- ❌ Aucun véhicule enregistré
- ❌ Moins de 2 crédits disponibles
- ❌ Formulaire incomplet

**Solution** : Ajouter un véhicule dans "Mon profil" > "Mes véhicules"

### Je ne vois pas le bouton "Laisser un avis"

**Causes possibles** :
- ❌ Le trajet n'est pas terminé
- ❌ Le conducteur n'a pas validé la fin du trajet
- ❌ Vous avez déjà laissé un avis pour ce trajet

**Solution** : Attendre que le conducteur marque le trajet comme "Terminé"

### Mon avis n'apparaît pas

**Explication** : Tous les avis passent par une validation manuelle par un employé.

**Délai** : Variable selon la disponibilité des employés (généralement sous 48h)

**Statuts** :
- En attente → Votre avis est en cours de modération
- Validé → Visible et compte dans la moyenne
- Rejeté → Contenu inapproprié (vous ne recevez pas de notification)

### Mon solde de crédits est incorrect

**Vérifications** :
1. Commission de 2 crédits lors de la création d'un trajet
2. Débit immédiat lors de la participation
3. Remboursement en cas d'annulation

**Historique** : Consultable dans "Mon profil" (section "Mes trajets")

### L'application ne charge pas

**Solutions** :
1. Vider le cache du navigateur (Ctrl+F5)
2. Vérifier la connexion Internet
3. Essayer un autre navigateur
4. Vérifier que JavaScript est activé

---

## Support technique

### Contact

- **Email** : support@ecoride.fr *(exemple)*
- **Discord/Slack** : [Lien communauté] *(si applicable)*

### Signaler un bug

- Décrire précisément le problème
- Indiquer les étapes pour reproduire
- Joindre une capture d'écran si possible
- Mentionner le navigateur utilisé

---

## Annexes

### Glossaire

- **Crédit** : Monnaie virtuelle interne à la plateforme
- **Conducteur** : Utilisateur proposant un trajet
- **Passager** : Utilisateur participant à un trajet
- **Employé** : Modérateur ayant accès à la validation des avis
- **Administrateur** : Super-utilisateur avec tous les droits
- **DTO** : Data Transfer Object (objet technique pour la sécurité)
- **JWT** : JSON Web Token (système d'authentification)

### Raccourcis clavier

- **Ctrl + K** : Ouvrir la recherche rapide *(si implémenté)*
- **Ctrl + P** : Accéder au profil
- **Ctrl + L** : Se déconnecter

### Changements de langue

L'application supporte :
- 🇫🇷 Français (FR)
- 🇬🇧 Anglais (EN)

Sélecteur dans la barre de navigation (icône drapeau)

---

**Document créé le 19 janvier 2026**
**Version 1.0**
**EcoRide - Plateforme de covoiturage écologique**
