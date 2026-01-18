# Documentation Technique - EcoRide

## Table des matières

1. [Architecture générale](#1-architecture-générale)
2. [Réflexions technologiques](#2-réflexions-technologiques)
3. [Configuration de l'environnement](#3-configuration-de-lenvironnement)
4. [Modèle conceptuel de données](#4-modèle-conceptuel-de-données)
5. [Diagrammes UML](#5-diagrammes-uml)
6. [API REST](#6-api-rest)
7. [Sécurité](#7-sécurité)
8. [Déploiement](#8-déploiement)

---

## 1. Architecture générale

### 1.1 Architecture globale

EcoRide suit une architecture en 3 couches :

```
┌─────────────────────────────────────┐
│      Frontend (Angular 20)          │
│   - Components                      │
│   - Services                        │
│   - Guards & Interceptors           │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               │ JSON
┌──────────────▼──────────────────────┐
│      Backend (.NET 9)               │
│   - Controllers (API REST)          │
│   - Services (Business Logic)       │
│   - Repositories (Data Access)      │
│   - Authentication (JWT)            │
└──────────────┬──────────────────────┘
               │
        ┌──────┴───────┐
        │              │
┌───────▼────┐   ┌────▼──────┐
│ PostgreSQL │   │  MongoDB  │
│ (Données   │   │ (Préfé-   │
│ relation-  │   │  rences)  │
│ nelles)    │   │           │
└────────────┘   └───────────┘
```

### 1.2 Choix architecturaux

**Backend .NET 9 :**
- Framework moderne et performant
- Excellent support pour les API REST
- Entity Framework Core pour l'ORM
- Injection de dépendances native
- Middleware pipeline flexible

**Frontend Angular 20 :**
- Framework structuré avec TypeScript
- Composants standalone (nouvelle approche Angular)
- Reactive programming avec RxJS
- Routing avancé avec guards
- Intercepteurs HTTP pour l'authentification

**Base de données hybride :**
- **PostgreSQL** : Données structurées (utilisateurs, covoiturages, etc.)
- **MongoDB** : Données flexibles (préférences personnalisées utilisateur)

### 1.3 Architecture Backend en couches

Le backend est organisé en 5 projets distincts suivant le principe de séparation des responsabilités :

```
EcoRide.Backend.WebApi      → Couche présentation (Controllers, Middleware)
         ↓
EcoRide.Backend.Business    → Couche métier (Services, Mappers, Helpers)
         ↓
EcoRide.Backend.Data        → Couche accès données (Repositories, Models, Context)
         ↓
EcoRide.Backend.Dtos        → Objets de transfert (DTOs)
         ↓
EcoRide.Backend.Client      → Client MongoDB (Préférences utilisateur)
```

**Avantages de cette architecture :**
- **Testabilité** : Chaque couche peut être testée indépendamment
- **Maintenabilité** : Séparation claire des responsabilités
- **Évolutivité** : Facile d'ajouter de nouvelles fonctionnalités
- **Réutilisabilité** : Les Dtos peuvent être partagés avec d'autres clients
- **Sécurité** : Les DTOs évitent l'exposition directe des entités

**Patterns appliqués :**
- **Repository Pattern** : Abstraction de l'accès aux données
- **DTO Pattern** : Évite les références circulaires et contrôle les données exposées
- **Service Layer Pattern** : Logique métier centralisée
- **Dependency Injection** : Couplage faible entre les couches

**Optimisations implémentées :**
- **Batch Queries** : Chargement groupé des ratings (évite N+1 queries)
- **Helper Methods** : Factorisation du code (DRY principle)
- **Async/Await** : Opérations asynchrones pour meilleure performance
- **DTO Mapping** : Évite les cycles de sérialisation JSON

---

## 2. Réflexions technologiques

### 2.1 Choix du stack technologique

#### Backend : Pourquoi .NET 9 ?

**Avantages :**
- Performance exceptionnelle (meilleure que Node.js/PHP)
- Type safety avec C#
- Écosystème mature et documenté
- Entity Framework Core pour l'abstraction base de données
- Support natif de l'asynchrone (async/await)
- Swagger intégré pour la documentation API

**Alternatives considérées :**
- Node.js/Express : Moins performant, moins typé
- Spring Boot : Plus lourd, configuration complexe
- Laravel (PHP) : Moins adapté aux applications modernes

#### Frontend : Pourquoi Angular 20 ?

**Avantages :**
- Framework complet (routing, forms, HTTP client intégrés)
- TypeScript natif (type safety)
- Architecture MVC claire
- Dependency injection
- RxJS pour la programmation réactive

**Alternatives considérées :**
- React : Nécessite beaucoup de bibliothèques tierces
- Vue.js : Moins adapté aux grandes applications

#### Base de données : Approche hybride

**PostgreSQL pour les données relationnelles :**
- ACID compliant
- Relations complexes (covoiturages, utilisateurs, participations)
- Requêtes SQL puissantes
- Index performants

**MongoDB pour les données flexibles :**
- Préférences utilisateur personnalisées (schema flexible)
- Notifications (structure variable)
- Pas besoin de migrations pour ces données

### 2.2 Patterns de conception utilisés

#### Backend

**Repository Pattern :**
```csharp
public interface IUtilisateurRepository {
    Task<Utilisateur> GetByIdAsync(int id);
    Task<Utilisateur> CreateAsync(Utilisateur utilisateur);
    // ...
}
```
- Abstraction de la couche d'accès aux données
- Facilite les tests unitaires
- Permet de changer la source de données

**Service Layer :**
```csharp
public class AuthService {
    public async Task<(Utilisateur?, string?)> LoginAsync(LoginDTO dto);
}
```
- Logique métier séparée des contrôleurs
- Réutilisabilité du code

**DTO Pattern :**
- Contrôle des données exposées par l'API
- Validation des entrées
- Sécurité (ne pas exposer les mots de passe hashés)

#### Frontend

**Observable Pattern (RxJS) :**
```typescript
this.authService.login(credentials).subscribe({
  next: (data) => { /* ... */ },
  error: (err) => { /* ... */ }
});
```

**Guard Pattern :**
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // Protection des routes
};
```

**Interceptor Pattern :**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ajout automatique du token JWT
};
```

---

## 3. Configuration de l'environnement

### 3.1 Prérequis détaillés

**Système d'exploitation :**
- Windows 10/11, macOS 12+, Linux (Ubuntu 20.04+)

**Logiciels requis :**
1. **.NET 9.0 SDK**
   ```bash
   dotnet --version  # Doit afficher 9.0.x
   ```

2. **Node.js & npm**
   ```bash
   node --version    # v18.x ou supérieur
   npm --version     # v9.x ou supérieur
   ```

3. **Angular CLI 20**
   ```bash
   npm install -g @angular/cli@20
   ng version
   ```

4. **PostgreSQL 14+**
   - Port par défaut : 5432
   - Créer un utilisateur `postgres` avec mot de passe

5. **MongoDB 5+**
   - Port par défaut : 27017
   - Pas d'authentification requise en local

### 3.2 Configuration Backend

**appsettings.json complet :**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=ecoride;Username=postgres;Password=votre_password",
    "MongoDB": "mongodb://localhost:27017"
  },
  "MongoDbSettings": {
    "DatabaseName": "ecoride_nosql",
    "PreferencesCollectionName": "preferences",
    "NotificationsCollectionName": "notifications"
  },
  "JwtSettings": {
    "SecretKey": "VotreCleSuperSecreteQuiDoitEtreTresLonguePourEtreSecurisee123456",
    "Issuer": "EcoRideAPI",
    "Audience": "EcoRideClient",
    "ExpirationInMinutes": 1440
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "noreply@ecoride.fr",
    "SenderName": "EcoRide",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

### 3.3 Variables d'environnement Frontend

**environment.ts (développement) :**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  version: '1.0.0'
};
```

**environment.prod.ts (production) :**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.ecoride.com/api',
  version: '1.0.0'
};
```

---

## 4. Modèle conceptuel de données

### 4.1 Schéma relationnel (PostgreSQL)

**Tables principales :**

1. **utilisateur**
   - `utilisateur_id` (PK, SERIAL)
   - `pseudo` (VARCHAR(80), UNIQUE)
   - `email` (VARCHAR(80), UNIQUE)
   - `password` (VARCHAR(80)) - Hash BCrypt
   - `credit` (INTEGER, DEFAULT 20)
   - `est_actif` (BOOLEAN, DEFAULT TRUE)

2. **role**
   - `role_id` (PK, SERIAL)
   - `libelle` (VARCHAR(50))
   - Valeurs : Passager, Chauffeur, Employe, Administrateur

3. **utilisateur_role** (table d'association)
   - `utilisateur_role_id` (PK)
   - `utilisateur_id` (FK)
   - `role_id` (FK)

4. **voiture**
   - `voiture_id` (PK)
   - `modele`, `immatriculation`, `energie`, `couleur`
   - `marque_id` (FK)
   - `utilisateur_id` (FK)
   - `nombre_places` (INTEGER)

5. **covoiturage**
   - `covoiturage_id` (PK)
   - `date_depart`, `heure_depart`, `lieu_depart`, `ville_depart`
   - `date_arrivee`, `heure_arrivee`, `lieu_arrivee`, `ville_arrivee`
   - `statut` (VARCHAR: En attente, En cours, Terminé, Annulé)
   - `nb_place`, `nb_place_restante`
   - `prix_personne` (FLOAT)
   - `voiture_id` (FK)
   - `utilisateur_id` (FK) - Le chauffeur

6. **covoiturage_participation**
   - `participation_id` (PK)
   - `covoiturage_id` (FK)
   - `utilisateur_id` (FK) - Le passager
   - `statut` (VARCHAR: Confirmé, Annulé, Validé)
   - `credit_utilise` (INTEGER)
   - `trajet_valide` (BOOLEAN)

7. **avis**
   - `avis_id` (PK)
   - `commentaire`, `note` (1-5)
   - `statut` (En attente, Validé, Refusé)
   - `utilisateur_auteur_id` (FK)
   - `utilisateur_cible_id` (FK)
   - `covoiturage_id` (FK, NULLABLE)

### 4.2 Schéma NoSQL (MongoDB)

**Collection preferences :**
```json
{
  "_id": ObjectId("..."),
  "utilisateur_id": 1,
  "fumeur": false,
  "animaux": true,
  "preferences_personnalisees": [
    "Musique classique",
    "Pas de discussion"
  ],
  "date_modification": ISODate("2025-01-15T10:00:00Z")
}
```

### 4.3 Relations importantes

**Un utilisateur peut avoir plusieurs rôles** (N-N via utilisateur_role)

**Un chauffeur possède plusieurs voitures** (1-N)

**Un covoiturage a un seul chauffeur mais plusieurs passagers** (1-N via covoiturage_participation)

**Un utilisateur peut donner et recevoir des avis** (2 relations 1-N sur la table avis)

---

## 5. Diagrammes UML

### 5.1 Diagramme de cas d'utilisation

```
┌──────────────────────────────────────────────────────────┐
│                    EcoRide System                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Visiteur                                                │
│    └─ S'inscrire                                         │
│    └─ Se connecter                                       │
│    └─ Rechercher des covoiturages                        │
│    └─ Voir détails covoiturage                           │
│                                                          │
│  Utilisateur (extends Visiteur)                          │
│    └─ Participer à un covoiturage                        │
│    └─ Gérer son profil                                   │
│    └─ Consulter ses crédits                              │
│    └─ Laisser un avis                                    │
│    └─ Annuler une participation                          │
│                                                          │
│  Chauffeur (extends Utilisateur)                         │
│    └─ Ajouter un véhicule                                │
│    └─ Créer un covoiturage                               │
│    └─ Démarrer/Terminer un trajet                        │
│    └─ Annuler un covoiturage                             │
│                                                          │
│  Employé                                                 │
│    └─ Valider/Refuser des avis                           │
│    └─ Gérer les problèmes signalés                       │
│                                                          │
│  Administrateur (extends Employé)                        │
│    └─ Créer des employés                                 │
│    └─ Suspendre/Activer des utilisateurs                 │
│    └─ Consulter les statistiques                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Diagramme de séquence - Participation à un covoiturage

```
Utilisateur    Frontend       Backend          PostgreSQL
    │             │              │                  │
    │──Clic──────▶│              │                  │
    │             │──POST────────▶│                  │
    │             │ /participate │                  │
    │             │              │──SELECT──────────▶│
    │             │              │ Covoiturage      │
    │             │              │◀─────────────────│
    │             │              │──SELECT──────────▶│
    │             │              │ User credit      │
    │             │              │◀─────────────────│
    │             │              │──INSERT──────────▶│
    │             │              │ Participation    │
    │             │              │──UPDATE──────────▶│
    │             │              │ Credit & Places  │
    │             │◀─────────────│                  │
    │◀────────────│ OK + msg     │                  │
    │  Confirmation│              │                  │
```

---

## 6. API REST

### 6.1 Endpoints principaux

**Authentification :**
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

**Covoiturages :**
- `POST /api/covoiturage/search` - Recherche
- `GET /api/covoiturage/{id}` - Détails
- `POST /api/covoiturage` - Créer (Auth requis, role Chauffeur)
- `POST /api/covoiturage/{id}/participate` - Participer (Auth requis)
- `POST /api/covoiturage/{id}/cancel` - Annuler (Auth requis)
- `GET /api/covoiturage/my-trips` - Mes trajets (Auth requis)

**Utilisateur :**
- `GET /api/user/profile` - Profil (Auth requis)
- `PUT /api/user/profile` - Modifier profil (Auth requis)
- `POST /api/user/add-role/{roleId}` - Ajouter rôle (Auth requis)
- `GET /api/user/vehicles` - Mes véhicules (Auth requis)
- `POST /api/user/vehicles` - Ajouter véhicule (Auth requis)

**Avis :**
- `GET /api/avis/user/{id}` - Avis d'un utilisateur
- `POST /api/avis` - Créer avis (Auth requis)
- `GET /api/avis/pending` - Avis en attente (Employé/Admin)
- `PUT /api/avis/{id}/validate` - Valider (Employé/Admin)
- `PUT /api/avis/{id}/reject` - Refuser (Employé/Admin)

**Administration :**
- `POST /api/admin/create-employee` - Créer employé (Admin)
- `PUT /api/admin/suspend-user/{id}` - Suspendre (Admin)
- `GET /api/admin/statistics` - Statistiques (Admin)
- `GET /api/admin/users` - Liste utilisateurs (Admin)

### 6.2 Format des requêtes/réponses

**Exemple : Recherche de covoiturage**

Request:
```json
POST /api/covoiturage/search
{
  "villeDepart": "Paris",
  "villeArrivee": "Lyon",
  "dateDepart": "2025-12-20",
  "estEcologique": true,
  "prixMax": 40,
  "noteMinimale": 4
}
```

Response (200 OK):
```json
[
  {
    "covoiturageId": 1,
    "villeDepart": "Paris",
    "villeArrivee": "Lyon",
    "dateDepart": "2025-12-20T00:00:00",
    "heureDepart": "08:00",
    "prixPersonne": 35,
    "nbPlaceRestante": 2,
    "estEcologique": true,
    "pseudoChauffeur": "jeandu",
    "noteMoyenneChauffeur": 4.7,
    "marqueVoiture": "Renault",
    "modeleVoiture": "Zoé",
    "energieVoiture": "Electrique"
  }
]
```

---

## 7. Sécurité

### 7.1 Authentification JWT

**Flow :**
1. Utilisateur envoie email + password
2. Backend vérifie avec BCrypt
3. Si OK, génère un JWT avec claims (id, email, roles)
4. Frontend stocke le token dans localStorage
5. Chaque requête inclut le token dans le header `Authorization: Bearer <token>`

**Contenu du JWT :**
```json
{
  "nameid": "1",
  "email": "jean@email.com",
  "unique_name": "jeandu",
  "role": ["Passager", "Chauffeur"],
  "exp": 1735689600
}
```

### 7.2 Hashage des mots de passe

Utilisation de **BCrypt** (cost factor 11) :
```csharp
var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
var isValid = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
```

### 7.3 Validation des données

**Backend (Data Annotations) :**
```csharp
public class RegisterDTO {
    [Required(ErrorMessage = "Le pseudo est requis")]
    [MinLength(3)]
    public string Pseudo { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$")]
    public string Password { get; set; }
}
```

**Frontend (Validation) :**
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  // Erreur
}
```

### 7.4 Protection CORS

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAngular", policy => {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### 7.5 Injection SQL

Protection automatique avec **Entity Framework Core** (requêtes paramétrées).

### 7.6 XSS

Angular échappe automatiquement les données dans les templates.

---

## 8. Déploiement

### 8.1 Déploiement Backend (.NET)

**Options de déploiement :**

1. **Azure App Service**
```bash
# Publier l'application
dotnet publish -c Release

# Déployer sur Azure
az webapp up --name ecoride-api --resource-group ecoride-rg
```

2. **Docker**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "EcoRide.Backend.dll"]
```

**Variables d'environnement production :**
- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__PostgreSQL`
- `ConnectionStrings__MongoDB`
- `JwtSettings__SecretKey`

### 8.2 Déploiement Frontend (Angular)

**Options :**

1. **Vercel**
```bash
npm install -g vercel
vercel --prod
```

2. **Netlify**
```bash
ng build --configuration production
# Déployer le dossier dist/
```

**Configuration production :**
- Modifier `environment.prod.ts` avec l'URL de l'API en production
- Activer la compression Gzip
- Activer le cache navigateur

### 8.3 Base de données

**PostgreSQL en production :**
- Utiliser un service managé (AWS RDS, Azure Database, etc.)
- Activer les backups automatiques
- Utiliser SSL pour les connexions

**MongoDB en production :**
- MongoDB Atlas (cloud managé)
- Authentification activée
- Whitelist des IPs

### 8.4 CI/CD

**GitHub Actions (exemple) :**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '9.0.x'
      - name: Publish
        run: dotnet publish -c Release
      - name: Deploy to Azure
        run: # commandes de déploiement

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Build
        run: |
          cd EcoRide.Frontend
          npm install
          ng build --configuration production
      - name: Deploy to Vercel
        run: # commandes de déploiement
```

---

## Conclusion

Cette documentation technique couvre l'ensemble de l'architecture et des choix techniques de l'application EcoRide. Pour toute question, contactez l'équipe de développement.

**Version:** 1.0
**Date:** Janvier 2025
**Auteur:** Équipe EcoRide
