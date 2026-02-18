# Gestion de Projet - EcoRide

## Méthodologie

### Approche Agile - Scrum

Le projet EcoRide a été développé en suivant la méthodologie Agile Scrum avec les adaptations suivantes :

**Sprints :**
- Durée : 1 semaine
- Planning : Début de chaque sprint
- Review : Fin de sprint
- Retrospective : Après chaque sprint

**Rôles :**
- Product Owner : José (Directeur technique EcoRide)
- Scrum Master : Développeur principal
- Team : Développeur Full-Stack

---

## Organisation Kanban

### Colonnes du tableau

1. **Backlog** : Toutes les fonctionnalités à développer (priorisées)
2. **À faire (Sprint actuel)** : Tâches prévues pour le sprint en cours
3. **En cours** : Tâche actuellement en développement
4. **En test** : Fonctionnalité développée, en phase de test
5. **Review** : En attente de validation
6. **Terminé (Dev)** : Mergé dans la branche develop
7. **En production (Main)** : Mergé dans la branche main

### Exemple de Kanban (Sprint 1)

#### Backlog (priorisé)
1. [P0 - Critique] US1 : Page d'accueil
2. [P0] US2 : Menu navigation
3. [P0] US7 : Création de compte
4. [P1] US3 : Vue des covoiturages
5. [P1] US4 : Filtres
6. [P1] US5 : Vue détaillée
7. [P1] US6 : Participation
8. [P2] US8 : Espace utilisateur
9. [P2] US9 : Saisir voyage
10. [P2] US10 : Historique
11. [P3] US11 : Démarrer/Terminer trajet
12. [P3] US12 : Espace employé
13. [P3] US13 : Espace admin

#### Sprint 1 (À faire)
- US1 : Page d'accueil
- US2 : Menu navigation
- US7 : Création de compte
- Configuration bases de données
- Modèles de données backend

#### En cours
- US1 : Page d'accueil (3h restantes)

#### En test
- Configuration PostgreSQL
- Modèles de données

#### Review
- (vide)

#### Terminé (Dev)
- Architecture backend
- Architecture frontend
- Configuration projet

#### En production (Main)
- (vide - sera rempli après validation finale)

---

## Planification des Sprints

### Sprint 1 : Infrastructure et base (Semaine 1)

**Objectifs :**
- Mise en place de l'infrastructure
- Base de données
- Authentification
- Pages de base

**User Stories :**
- US1 : Page d'accueil
- US2 : Menu navigation
- US7 : Création de compte + Connexion

**Tasks techniques :**
- Setup projet .NET 9
- Setup projet Angular 20
- Configuration PostgreSQL
- Configuration MongoDB
- Modèles de données
- Controllers Auth
- Service Auth frontend
- Guards Angular

**Estimation :** 20h
**Résultat :** ✅ Complété

---

### Sprint 2 : Recherche et consultation (Semaine 2)

**Objectifs :**
- Recherche de covoiturages
- Affichage des résultats
- Vue détaillée

**User Stories :**
- US3 : Vue des covoiturages
- US4 : Filtres des covoiturages
- US5 : Vue détaillée d'un covoiturage

**Tasks :**
- Controller Covoiturage (search, getById)
- Repository Covoiturage
- Component CovoiturageList
- Component CovoiturageDetail
- Filtres côté frontend
- Service Covoiturage frontend

**Estimation :** 18h
**Résultat :** ✅ Complété

---

### Sprint 3 : Participation et gestion utilisateur (Semaine 3)

**Objectifs :**
- Participation aux covoiturages
- Espace utilisateur
- Gestion des véhicules

**User Stories :**
- US6 : Participer à un covoiturage
- US8 : Espace utilisateur
- Ajouter des véhicules

**Tasks :**
- Endpoint participation
- Logique crédits
- Component Profile
- Service User
- Gestion véhicules
- Préférences MongoDB

**Estimation :** 16h
**Résultat :** ✅ Complété

---

### Sprint 4 : Chauffeur et trajets (Semaine 4)

**Objectifs :**
- Création de trajets
- Gestion des trajets
- Historique

**User Stories :**
- US9 : Saisir un voyage
- US10 : Historique des covoiturages
- US11 : Démarrer/Terminer trajet

**Tasks :**
- Controller create covoiturage
- Controller start/complete
- Component create trip
- Component my trips
- Email service
- Validation trajet

**Estimation :** 20h
**Résultat :** ✅ Complété

---

### Sprint 5 : Modération et admin (Semaine 5)

**Objectifs :**
- Espace employé
- Espace admin
- Gestion des avis

**User Stories :**
- US12 : Espace employé
- US13 : Espace administrateur
- Système d'avis complet

**Tasks :**
- Controller Avis
- Controller Admin
- Component EmployeeDashboard
- Component AdminDashboard
- Statistiques backend
- Graphiques frontend (Chart.js)

**Estimation :** 20h
**Résultat :** ✅ Complété

---

### Sprint 6 : Tests, documentation, déploiement (Semaine 6)

**Objectifs :**
- Tests de l'application
- Documentation
- Déploiement

**Tasks :**
- Tests manuels de toutes les US
- Correction des bugs
- README.md
- Documentation technique
- Charte graphique
- Manuel utilisateur
- Déploiement backend
- Déploiement frontend

**Estimation :** 16h
**Résultat :** ✅ Complété

---

## Gestion des tâches

### Priorisation

**Priorités (MoSCoW) :**
- **Must have (P0)** : Fonctionnalités critiques sans lesquelles l'app ne fonctionne pas
- **Should have (P1)** : Fonctionnalités importantes
- **Could have (P2)** : Fonctionnalités souhaitables
- **Won't have (P3)** : Fonctionnalités reportées

**Exemples :**
- P0 : Authentification, Recherche covoiturage, Participation
- P1 : Filtres, Avis, Gestion véhicules
- P2 : Statistiques avancées, Export données
- P3 : Chat en temps réel, Application mobile

### Estimation

**Méthode : Planning Poker (Fibonacci)**
- 1 point = 1 heure
- 2 points = 2 heures
- 3 points = 3-4 heures
- 5 points = 1 jour
- 8 points = 2 jours
- 13 points = Trop gros, à découper

**Exemples :**
- US1 Page d'accueil : 3 points
- US3 Vue covoiturages : 5 points
- US6 Participation : 8 points
- US13 Espace admin : 8 points

---

## Branches Git

### Stratégie de branching

```
main (production)
  ↑
  merge après tests complets
  ↑
develop (développement)
  ↑
  merge après feature complète
  ↑
feature/US-xxx (feature branches)
```

**Branches :**
- `main` : Code en production, stable
- `develop` : Code de développement, testé
- `feature/US-01-homepage` : Fonctionnalité spécifique
- `feature/US-03-search` : etc.
- `hotfix/fix-credit-bug` : Correction urgente

### Convention de commits

**Format :**
```
<type>(<scope>): <description>

[corps optionnel]
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Tâches diverses

**Exemples :**
```
feat(auth): add JWT authentication

Implement JWT token generation and validation.
Add login and register endpoints.
```

```
fix(covoiturage): fix credit deduction bug

Credits were not properly deducted when participating.
```

```
docs(readme): update installation instructions
```

---

## Outils utilisés

### Gestion de projet
- **Trello / Notion** : Tableau Kanban
- **GitHub Projects** : Alternative intégrée

### Communication
- **Email** : Communication avec le Product Owner
- **Slack / Discord** : Communication instantanée (si équipe)

### Documentation
- **Markdown** : Documentation technique
- **Draw.io / Lucidchart** : Diagrammes UML
- **Swagger** : Documentation API

### Tests
- **Postman** : Tests API
- **Browser DevTools** : Tests frontend
- **PostgreSQL CLI** : Vérification base de données

---

## Métriques et suivi

### Burndown Chart (exemple Sprint 2)

```
Heures restantes
20 │ •
18 │ •\
16 │   •\
14 │     •\
12 │       •\
10 │         •\
8  │           •\
6  │             •\
4  │               •\
2  │                 •\
0  │___________________•______
   Lun Mar Mer Jeu Ven
```

### Velocity

- Sprint 1 : 20 points complétés
- Sprint 2 : 18 points complétés
- Sprint 3 : 16 points complétés
- Sprint 4 : 20 points complétés
- Sprint 5 : 20 points complétés
- **Moyenne : 18.8 points/sprint**

### Qualité du code

**Critères :**
- Respect des conventions de nommage : ✅
- Commentaires sur code complexe : ✅
- Séparation des responsabilités : ✅
- Gestion des erreurs : ✅
- Validation des données : ✅

---

## Risques et gestion

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Retard sur le sprint | Moyen | Élevé | Priorisation stricte, découpage des tâches |
| Bug de sécurité | Faible | Critique | Validation systématique, BCrypt, JWT |
| Performance base de données | Moyen | Moyen | Index SQL, requêtes optimisées |
| Problèmes CORS | Élevé | Moyen | Configuration CORS dès le début |

### Actions prises

- Création d'un backlog clair avec priorisation
- Tests manuels réguliers
- Commits fréquents
- Documentation au fur et à mesure

---

## Retrospectives

### Sprint 1
**Ce qui a bien fonctionné :**
- Architecture claire
- Configuration rapide

**À améliorer :**
- Meilleure estimation des tâches
- Plus de commits intermédiaires

**Actions :**
- Découper les grandes tâches
- Commit après chaque sous-tâche

### Sprint 2
**Ce qui a bien fonctionné :**
- Bonne vélocité
- Filtres fonctionnels

**À améliorer :**
- Tests plus systématiques

**Actions :**
- Tester chaque endpoint avec Postman avant de passer au suivant

---

## Conclusion

La gestion de projet Agile avec un Kanban a permis de :
- Livrer régulièrement des fonctionnalités
- Adapter les priorités si nécessaire
- Maintenir une bonne visibilité sur l'avancement
- Respecter les deadlines

**Durée totale du projet :** 6 semaines
**Points complétés :** ~110 points
**User Stories complétées :** 13/13

**Date :** Janvier 2025
**Version :** 1.0
