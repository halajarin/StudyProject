# Charte Graphique - EcoRide

## Version 1.0 - Janvier 2026

---

## Table des matières

1. [Identité visuelle](#1-identité-visuelle)
2. [Palette de couleurs](#2-palette-de-couleurs)
3. [Typographie](#3-typographie)
4. [Logo et iconographie](#4-logo-et-iconographie)
5. [Composants UI](#5-composants-ui)
6. [Grille et espacement](#6-grille-et-espacement)
7. [Accessibilité](#7-accessibilité)
8. [Exemples d'application](#8-exemples-dapplication)

---

## 1. Identité visuelle

### Concept

EcoRide est une plateforme de covoiturage **écologique** et **moderne**. L'identité visuelle doit refléter :

- 🌱 **Écologie** : Couleurs vertes dominantes
- 🚗 **Mobilité** : Design épuré et dynamique
- 🤝 **Partage** : Interface conviviale et accessible
- 💡 **Innovation** : Technologies modernes (Angular, .NET)

### Valeurs de la marque

- **Durabilité** : Encourager le covoiturage pour réduire l'empreinte carbone
- **Simplicité** : Interface intuitive, parcours utilisateur fluide
- **Confiance** : Système d'avis et de validation transparent
- **Communauté** : Plateforme de partage et d'entraide

---

## 2. Palette de couleurs

### Couleurs principales

#### Vert Principal (Primary Green)
```css
--primary-green: #28a745;
```
- **Utilisation** : Boutons principaux, liens, éléments interactifs
- **RGB** : rgb(40, 167, 69)
- **HSL** : hsl(134, 61%, 41%)
- **Symbolisme** : Écologie, nature, action positive

#### Vert Foncé (Dark Green)
```css
--dark-green: #1e7e34;
```
- **Utilisation** : Survol des boutons, textes importants
- **RGB** : rgb(30, 126, 52)
- **Contraste** : AAA sur fond blanc

#### Vert Clair (Light Green)
```css
--light-green: #d4edda;
```
- **Utilisation** : Arrière-plans des messages de succès, zones de mise en évidence
- **RGB** : rgb(212, 237, 218)

#### Vert Très Clair (Very Light Green)
```css
--very-light-green: #e9f7ec;
```
- **Utilisation** : Arrière-plans légers, sections secondaires
- **RGB** : rgb(233, 247, 236)

### Couleurs secondaires

#### Bleu Info
```css
--info-blue: #17a2b8;
```
- **Utilisation** : Messages informatifs, badges
- **RGB** : rgb(23, 162, 184)

#### Jaune Avertissement
```css
--warning-yellow: #ffc107;
```
- **Utilisation** : Alertes, messages d'avertissement
- **RGB** : rgb(255, 193, 7)

#### Rouge Erreur
```css
--error-red: #dc3545;
```
- **Utilisation** : Messages d'erreur, actions destructives
- **RGB** : rgb(220, 53, 69)

#### Vert Succès
```css
--success-green: #28a745;
```
- **Utilisation** : Confirmations, validations
- **RGB** : rgb(40, 167, 69) (identique au primary green)

### Couleurs neutres

#### Texte Principal
```css
--text-dark: #212529;
```
- **Utilisation** : Corps de texte, titres
- **RGB** : rgb(33, 37, 41)

#### Texte Secondaire
```css
--text-muted: #6c757d;
```
- **Utilisation** : Textes secondaires, labels
- **RGB** : rgb(108, 117, 125)

#### Arrière-plan Clair
```css
--background-light: #f8f9fa;
```
- **Utilisation** : Fond de page, sections
- **RGB** : rgb(248, 249, 250)

#### Bordures
```css
--border-color: #dee2e6;
```
- **Utilisation** : Contours, séparateurs
- **RGB** : rgb(222, 226, 230)

#### Blanc
```css
--white: #ffffff;
```
- **Utilisation** : Cartes, modales, zones de contenu

---

## 3. Typographie

### Polices de caractères

#### Police principale : **Roboto**
```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Caractéristiques** :
- Police moderne et lisible
- Excellente sur tous les supports (desktop, mobile)
- Disponible via Google Fonts
- Variantes : Light (300), Regular (400), Medium (500), Bold (700)

**Chargement** :
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

#### Police alternative (fallback)
Si Roboto ne charge pas : system fonts (SF Pro sur macOS, Segoe UI sur Windows)

### Tailles de police

| Élément | Taille | Poids | Utilisation |
|---------|--------|-------|-------------|
| **H1** | 2.5rem (40px) | 700 (Bold) | Titre principal de page |
| **H2** | 2rem (32px) | 700 (Bold) | Titres de sections |
| **H3** | 1.75rem (28px) | 500 (Medium) | Sous-titres |
| **H4** | 1.5rem (24px) | 500 (Medium) | Titres de cartes |
| **H5** | 1.25rem (20px) | 500 (Medium) | Petits titres |
| **Body** | 1rem (16px) | 400 (Regular) | Corps de texte |
| **Small** | 0.875rem (14px) | 400 (Regular) | Textes secondaires |
| **Caption** | 0.75rem (12px) | 400 (Regular) | Légendes, labels |

### Interligne (Line-height)

- **Titres (H1-H5)** : `line-height: 1.2;`
- **Corps de texte** : `line-height: 1.6;`
- **Boutons** : `line-height: 1.5;`

### Espacement des lettres

- **Titres** : `letter-spacing: -0.02em;` (légèrement serré)
- **Corps de texte** : `letter-spacing: normal;`
- **Boutons** : `letter-spacing: 0.05em;` (légèrement espacé)

---

## 4. Logo et iconographie

### Logo EcoRide

#### Description
Le logo EcoRide combine un symbole de voiture avec une feuille verte, représentant le covoiturage écologique.

**Composition** :
- 🚗 **Icône** : Voiture stylisée
- 🌿 **Feuille** : Superposée ou intégrée à la voiture
- **Texte** : "EcoRide" en Roboto Bold

**Couleurs du logo** :
- Version principale : Vert principal (#28a745) + Texte foncé (#212529)
- Version inversée : Blanc sur fond vert foncé
- Version monochrome : Gris foncé (#212529) pour impression

#### Dimensions minimales
- **Web** : 150px de largeur minimum
- **Mobile** : 120px de largeur minimum
- **Favicon** : 32x32px, 64x64px

#### Espace de protection
Laisser un espace vide équivalent à la hauteur de la lettre "E" autour du logo.

### Iconographie

#### Bibliothèque d'icônes

**Source** : Font Awesome 6 (version gratuite)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
```

**Style** : Icônes outline (contour) pour correspondre au design épuré

#### Icônes principales

| Fonction | Icône | Code |
|----------|-------|------|
| **Recherche** | 🔍 | `<i class="fas fa-search"></i>` |
| **Profil** | 👤 | `<i class="fas fa-user"></i>` |
| **Véhicule** | 🚗 | `<i class="fas fa-car"></i>` |
| **Localisation** | 📍 | `<i class="fas fa-map-marker-alt"></i>` |
| **Calendrier** | 📅 | `<i class="fas fa-calendar-alt"></i>` |
| **Crédits** | 💳 | `<i class="fas fa-coins"></i>` |
| **Avis** | ⭐ | `<i class="fas fa-star"></i>` |
| **Validation** | ✅ | `<i class="fas fa-check-circle"></i>` |
| **Erreur** | ❌ | `<i class="fas fa-times-circle"></i>` |
| **Menu** | ☰ | `<i class="fas fa-bars"></i>` |
| **Déconnexion** | 🚪 | `<i class="fas fa-sign-out-alt"></i>` |
| **Paramètres** | ⚙️ | `<i class="fas fa-cog"></i>` |

#### Tailles des icônes

- **Petite** : 16px
- **Normale** : 20px
- **Grande** : 24px
- **Extra-grande** : 32px (illustrations)

---

## 5. Composants UI

### Boutons

#### Bouton Principal (Primary)
```css
.btn-primary {
  background-color: var(--primary-green);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: none;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--dark-green);
}
```

**Utilisation** : Actions principales (S'inscrire, Participer, Créer un trajet)

#### Bouton Secondaire (Secondary)
```css
.btn-secondary {
  background-color: transparent;
  color: var(--primary-green);
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: 2px solid var(--primary-green);
  font-weight: 500;
}

.btn-secondary:hover {
  background-color: var(--very-light-green);
}
```

**Utilisation** : Actions secondaires (Annuler, Retour)

#### Bouton Danger
```css
.btn-danger {
  background-color: var(--error-red);
  color: white;
}
```

**Utilisation** : Actions destructives (Supprimer, Rejeter)

#### États des boutons

- **:hover** : Changement de couleur
- **:active** : Légère réduction d'échelle (`transform: scale(0.98)`)
- **:disabled** : Opacité 0.5, curseur `not-allowed`

### Cartes (Cards)

```css
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

**Utilisation** : Résultats de recherche, détails de covoiturage, profil utilisateur

### Formulaires

#### Champs de saisie
```css
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}
```

#### Labels
```css
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}
```

#### Messages d'erreur
```css
.error-message {
  color: var(--error-red);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

### Navigation

#### Barre de navigation
```css
.navbar {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Éléments** :
- Logo à gauche
- Liens de navigation au centre
- Profil utilisateur + crédits à droite

#### Liens
```css
.nav-link {
  color: var(--text-dark);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: var(--background-light);
}

.nav-link.active {
  color: var(--primary-green);
  font-weight: 500;
}
```

### Badges

```css
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 12px;
}

.badge-success {
  background-color: var(--success-green);
  color: white;
}

.badge-warning {
  background-color: var(--warning-yellow);
  color: var(--text-dark);
}

.badge-danger {
  background-color: var(--error-red);
  color: white;
}
```

**Utilisation** : Statuts (En attente, Terminé, Annulé)

### Alertes

```css
.alert {
  padding: 1rem 1.25rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border-left: 4px solid;
}

.alert-success {
  background-color: var(--light-green);
  border-left-color: var(--success-green);
  color: var(--dark-green);
}

.alert-error {
  background-color: #f8d7da;
  border-left-color: var(--error-red);
  color: #721c24;
}
```

---

## 6. Grille et espacement

### Système de grille

**Container** :
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

**Responsive breakpoints** :
- **Mobile** : < 576px
- **Tablet** : 576px - 768px
- **Desktop** : 768px - 1200px
- **Large desktop** : > 1200px

### Espacements

#### Échelle d'espacement (basée sur 8px)

| Variable | Valeur | Utilisation |
|----------|--------|-------------|
| `--space-1` | 0.25rem (4px) | Très petit |
| `--space-2` | 0.5rem (8px) | Petit |
| `--space-3` | 1rem (16px) | Normal |
| `--space-4` | 1.5rem (24px) | Moyen |
| `--space-5` | 2rem (32px) | Grand |
| `--space-6` | 3rem (48px) | Très grand |

#### Marges et padding

- **Entre sections** : `--space-5` (32px)
- **Entre éléments** : `--space-3` (16px)
- **Entre lignes de texte** : `--space-2` (8px)
- **Padding des cartes** : `--space-4` (24px)
- **Padding des boutons** : `--space-2` vertical, `--space-4` horizontal

### Bordures

- **Rayon standard** : `5px`
- **Rayon cartes** : `8px`
- **Rayon badges** : `12px`
- **Rayon boutons** : `5px`

---

## 7. Accessibilité

### Contrastes

Tous les contrastes respectent **WCAG 2.1 niveau AA** minimum :

- **Texte normal** : Ratio ≥ 4.5:1
- **Texte large (≥18px ou ≥14px bold)** : Ratio ≥ 3:1

**Exemples validés** :
- Vert principal sur blanc : 3.3:1 ✅ (texte large uniquement)
- Vert foncé sur blanc : 5.4:1 ✅ (texte normal)
- Texte foncé sur blanc : 15.8:1 ✅

### Focus visuel

Tous les éléments interactifs ont un indicateur de focus :
```css
*:focus {
  outline: 2px solid var(--primary-green);
  outline-offset: 2px;
}
```

### Navigation au clavier

- **Tab** : Navigation entre éléments
- **Entrée** : Activation des boutons/liens
- **Espace** : Sélection des cases à cocher
- **Échap** : Fermeture des modales

### Textes alternatifs

- Toutes les images ont un attribut `alt` descriptif
- Les icônes décoratives ont `aria-hidden="true"`
- Les icônes fonctionnelles ont des labels (`aria-label`)

### Support multi-langue

- Interface en français (FR) et anglais (EN)
- Sélecteur de langue dans la navigation
- Toutes les chaînes de texte sont externalisées (i18n)

---

## 8. Exemples d'application

### Page d'accueil

**Structure** :
1. **Header** : Navbar avec logo, liens, profil
2. **Hero section** :
   - Titre H1 : "Partagez vos trajets, réduisez votre empreinte carbone"
   - Barre de recherche principale (départ, arrivée, date)
   - Bouton CTA : "Rechercher un covoiturage"
3. **Features section** :
   - 3 cartes (Économique, Écologique, Sécurisé)
4. **Footer** : Liens légaux, réseaux sociaux

**Palette** :
- Fond : Blanc
- Accents : Vert principal
- Texte : Gris foncé

### Page de résultats de recherche

**Cartes de covoiturage** :
```
┌─────────────────────────────────────────┐
│ 🚗 Paris → Lyon                         │
│                                         │
│ 📅 20/01/2026 - 08:00                   │
│ 💳 25 crédits/personne                  │
│ 👤 Jean Dupont ⭐⭐⭐⭐⭐ (4.5)         │
│ 🔋 Tesla Model 3 (Électrique)           │
│ 📍 3 places disponibles                 │
│                                         │
│          [Voir détails →]               │
└─────────────────────────────────────────┘
```

**Couleurs** :
- Carte : Fond blanc, bordure gris clair
- Hover : Ombre portée accentuée
- Bouton : Vert principal

### Page de profil

**Sections** :
1. **Informations personnelles** : Avatar, nom, email, solde
2. **Mes véhicules** : Liste + formulaire d'ajout
3. **Mes trajets** : Onglets (Conducteur/Passager)
4. **Avis reçus** : Liste avec étoiles

**Palette** :
- Fond général : Gris très clair (#f8f9fa)
- Cartes : Blanc
- Badges de statut : Couleurs sémantiques (vert/jaune/rouge)

### Formulaire de création de trajet

**Layout** :
- 2 colonnes sur desktop
- 1 colonne sur mobile
- Champs clairement labellisés
- Bouton "Créer" en vert principal, "Annuler" en secondaire

### Modal de confirmation

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
}
```

---

## Annexes

### Variables CSS complètes

```css
:root {
  /* Couleurs principales */
  --primary-green: #28a745;
  --dark-green: #1e7e34;
  --light-green: #d4edda;
  --very-light-green: #e9f7ec;

  /* Couleurs secondaires */
  --info-blue: #17a2b8;
  --warning-yellow: #ffc107;
  --error-red: #dc3545;
  --success-green: #28a745;

  /* Couleurs neutres */
  --text-dark: #212529;
  --text-muted: #6c757d;
  --background-light: #f8f9fa;
  --border-color: #dee2e6;
  --white: #ffffff;

  /* Typographie */
  --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;

  /* Espacements */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;

  /* Bordures */
  --border-radius: 5px;
  --border-radius-lg: 8px;
  --border-radius-pill: 12px;

  /* Ombres */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

### Ressources

- **Polices** : Google Fonts (Roboto)
- **Icônes** : Font Awesome 6
- **Framework CSS** : Custom (inspiré de Bootstrap)
- **Framework JS** : Angular 20

### Outils recommandés

- **Design** : Figma
- **Prototypage** : Figma, Adobe XD
- **Validation accessibilité** : WAVE, axe DevTools
- **Validation contrastes** : WebAIM Contrast Checker

---

**Document créé le 19 janvier 2026**
**Version 1.0**
**EcoRide - Charte graphique officielle**
