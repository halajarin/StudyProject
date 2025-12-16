# EcoRide - Plateforme de Covoiturage Écologique

## 📋 Sommaire

- [Description](#description)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement local](#déploiement-local)
- [Structure du projet](#structure-du-projet)
- [Identifiants de test](#identifiants-de-test)
- [Documentation](#documentation)

## 📝 Description

EcoRide est une application web de covoiturage qui encourage les déplacements écologiques. La plateforme permet aux utilisateurs de proposer et de rechercher des trajets en covoiturage, avec une attention particulière portée aux véhicules électriques.

### Fonctionnalités principales

- **Gestion des utilisateurs** : Inscription, connexion, profil utilisateur
- **Recherche de covoiturages** : Recherche par ville de départ/arrivée et date avec filtres avancés
- **Gestion des trajets** : Création, participation, annulation de covoiturages
- **Système de crédits** : Monnaie virtuelle pour les transactions
- **Système d'avis** : Notation et commentaires des chauffeurs
- **Espace chauffeur** : Gestion des véhicules et des trajets
- **Espace employé** : Modération des avis
- **Espace administrateur** : Gestion des utilisateurs et statistiques

## 🚀 Technologies utilisées

### Backend
- **.NET 9.0** - Framework principal
- **ASP.NET Core** - API REST
- **Entity Framework Core 9.0** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **MongoDB 3.2** - Base de données NoSQL (préférences utilisateurs)
- **JWT** - Authentification et autorisation
- **BCrypt.Net** - Hashage des mots de passe
- **Swagger** - Documentation API

### Frontend
- **Angular 20** - Framework frontend
- **TypeScript 5.6** - Langage
- **RxJS 7.8** - Programmation réactive
- **Chart.js** - Graphiques (dashboard admin)

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [MongoDB 5+](https://www.mongodb.com/try/download/community)
- [Angular CLI 20](https://angular.io/cli) : `npm install -g @angular/cli@20`

## 💻 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/your-username/ecoride.git
cd ecoride
```

### 2. Configuration de la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Exécuter les scripts SQL dans l'ordre
psql -U postgres -f Database/01_create_database.sql
psql -U postgres -d ecoride -f Database/02_create_tables.sql
psql -U postgres -d ecoride -f Database/03_insert_data.sql
```

### 3. Configuration de MongoDB

```bash
# Démarrer MongoDB
mongod

# MongoDB créera automatiquement la base de données au premier accès
```

### 4. Installation du Backend

```bash
cd EcoRide.Backend

# Restaurer les packages NuGet
dotnet restore

# Construire le projet
dotnet build
```

### 5. Installation du Frontend

```bash
cd ../EcoRide.Frontend

# Installer les dépendances npm
npm install
```

## ⚙️ Configuration

### Backend (appsettings.json)

Modifier le fichier `EcoRide.Backend/appsettings.json` :

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=ecoride;Username=postgres;Password=votre_mot_de_passe",
    "MongoDB": "mongodb://localhost:27017"
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

### Frontend (environment.ts)

Le fichier `EcoRide.Frontend/src/environments/environment.ts` est déjà configuré :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 🏃 Déploiement local

### Démarrer le Backend

```bash
cd EcoRide.Backend
dotnet run
```

L'API sera accessible sur :
- http://localhost:5000
- Swagger UI : http://localhost:5000/swagger

### Démarrer le Frontend

```bash
cd EcoRide.Frontend
ng serve
```

L'application sera accessible sur : http://localhost:4200

## 📁 Structure du projet

```
EcoRide/
├── EcoRide.Backend/
│   ├── Controllers/          # Contrôleurs API
│   ├── Data/                 # Context EF Core
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Models/               # Entités
│   ├── Repositories/         # Couche d'accès aux données
│   ├── Services/             # Logique métier
│   ├── Middleware/           # Middlewares personnalisés
│   └── Program.cs            # Point d'entrée
│
├── EcoRide.Frontend/
│   └── src/
│       └── app/
│           ├── components/   # Composants Angular
│           ├── services/     # Services
│           ├── models/       # Modèles TypeScript
│           ├── guards/       # Guards de routing
│           └── interceptors/ # Intercepteurs HTTP
│
├── Database/
│   ├── 01_create_database.sql
│   ├── 02_create_tables.sql
│   └── 03_insert_data.sql
│
├── Documentation/            # Documentation complète
└── README.md                # Ce fichier
```

## 🔑 Identifiants de test

### Utilisateurs

**Chauffeur/Passager :**
- Email : jean.dupont@email.com
- Mot de passe : Password123!

**Chauffeur/Passager :**
- Email : marie.martin@email.com
- Mot de passe : Password123!

**Employé :**
- Email : support@ecoride.fr
- Mot de passe : Password123!

**Administrateur :**
- Email : admin@ecoride.fr
- Mot de passe : Password123!

## 📚 Documentation

Pour plus de détails, consultez :

- [Documentation technique complète](./Documentation/Documentation_Technique.md)
- [Manuel utilisateur](./Documentation/Manuel_Utilisateur.pdf)
- [Charte graphique](./Documentation/Charte_Graphique.pdf)
- [Gestion de projet](./Documentation/Gestion_Projet.md)

## 🐛 Dépannage

### Erreur de connexion à PostgreSQL

Vérifiez que :
- PostgreSQL est démarré
- Les credentials dans `appsettings.json` sont corrects
- Le port 5432 est disponible

### Erreur de connexion à MongoDB

Vérifiez que :
- MongoDB est démarré
- Le port 27017 est disponible

### Erreur CORS

Si vous obtenez des erreurs CORS :
- Vérifiez que le backend est configuré pour accepter les requêtes depuis `http://localhost:4200`
- Redémarrez le backend après modification

### Erreur de compilation Angular

```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licence

Ce projet est développé dans le cadre d'un examen et est destiné à des fins éducatives.

## 👥 Auteurs

Développé pour l'examen DWWM - EcoRide

## 📞 Contact

Pour toute question : contact@ecoride.fr
