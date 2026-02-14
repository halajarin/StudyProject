# Guide Maquettes & Wireframes - EcoRide

## Version 1.0 - Janvier 2026

---

## Table des matières

1. [Spécifications ECF](#1-spécifications-ecf)
2. [Wireframes requis](#2-wireframes-requis)
3. [Mockups requis](#3-mockups-requis)
4. [Outils recommandés](#4-outils-recommandés)
5. [Guide de création pas à pas](#5-guide-de-création-pas-à-pas)

---

## 1. Spécifications ECF

### Livrables obligatoires

L'ECF DWWM exige :
- **3 wireframes desktop** (basse fidélité, noir et blanc)
- **3 wireframes mobile** (basse fidélité, noir et blanc)
- **3 mockups desktop** (haute fidélité, couleurs, images)
- **3 mockups mobile** (haute fidélité, couleurs, images)

### Pages à maquetter (recommandations)

1. **Page d'accueil** (index) - Première impression
2. **Page de recherche** (liste de covoiturages) - Fonctionnalité principale
3. **Page détail covoiturage** (vue détaillée) - Parcours utilisateur

**Alternative** : Accueil, Profil utilisateur, Création de trajet

---

## 2. Wireframes requis

### 2.1 Wireframe Desktop - Page d'accueil

#### Dimensions
- **Largeur** : 1920px (Full HD)
- **Hauteur** : ~1080px (variable selon contenu)

#### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo EcoRide]    Accueil  Rechercher  Profil  [Se connecter]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              PARTAGEZ VOS TRAJETS,                           │
│         RÉDUISEZ VOTRE EMPREINTE CARBONE                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Départ: ___________] [Arrivée: ___________]       │    │
│  │ [Date: __/__/____]    [Rechercher >]              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │   [💰]    │  │   [🌱]    │  │   [🔒]    │              │
│  │           │  │           │  │           │              │
│  │Économique │  │Écologique │  │ Sécurisé  │              │
│  │           │  │           │  │           │              │
│  │[Texte]    │  │[Texte]    │  │[Texte]    │              │
│  └───────────┘  └───────────┘  └───────────┘              │
├─────────────────────────────────────────────────────────────┤
│  Comment ça marche ?                                         │
│  1. Recherchez un trajet                                     │
│  2. Réservez avec vos crédits                                │
│  3. Voyagez ensemble                                         │
│  4. Laissez un avis                                          │
├─────────────────────────────────────────────────────────────┤
│ Footer : Mentions légales | CGU | Contact | © 2026          │
└─────────────────────────────────────────────────────────────┘
```

#### Éléments clés à inclure

**Navigation (Header)** :
- Logo EcoRide (texte ou placeholder [Logo])
- Menu horizontal : Accueil, Rechercher, Profil
- Bouton "Se connecter" (outline)

**Hero section** :
- Titre principal (H1) : "Partagez vos trajets, réduisez votre empreinte carbone"
- Sous-titre (optionnel)
- **Barre de recherche** :
  - Champ "Départ" (input text)
  - Champ "Arrivée" (input text)
  - Champ "Date" (date picker)
  - Bouton "Rechercher" (CTA primaire)

**Features section** :
- 3 cartes côte à côte
- Icônes (placeholders : 💰, 🌱, 🔒)
- Titres : Économique, Écologique, Sécurisé
- Texte descriptif (lorem ipsum acceptable)

**How it works** :
- Titre "Comment ça marche ?"
- 4 étapes numérotées

**Footer** :
- Liens : Mentions légales, CGU, Contact
- Copyright

---

### 2.2 Wireframe Desktop - Page de recherche

#### Dimensions
- **Largeur** : 1920px
- **Hauteur** : ~1200px

#### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo EcoRide]    Accueil  Rechercher  Profil  [Jean Dupont]│
├─────────────────────────────────────────────────────────────┤
│ Filtres                   │  Résultats (12 covoiturages)    │
│                           │                                  │
│ [Prix max: ____]          │  ┌──────────────────────────┐  │
│ [Durée max: ____]         │  │ Paris → Lyon             │  │
│ [Note min: ⭐⭐⭐]      │  │ 20/01/2026 - 08:00       │  │
│ [Type véhicule]           │  │ 25 crédits/personne      │  │
│  ☐ Électrique             │  │ Jean Dupont ⭐⭐⭐⭐⭐  │  │
│  ☐ Hybride                │  │ Tesla Model 3            │  │
│  ☐ GNV                    │  │ 3 places disponibles     │  │
│                           │  │ [Voir détails →]        │  │
│ [Appliquer les filtres]   │  └──────────────────────────┘  │
│                           │                                  │
│                           │  ┌──────────────────────────┐  │
│                           │  │ Lyon → Marseille         │  │
│                           │  │ 21/01/2026 - 14:30       │  │
│                           │  │ 30 crédits/personne      │  │
│                           │  │ Marie Durand ⭐⭐⭐⭐    │  │
│                           │  │ Renault Zoe              │  │
│                           │  │ 2 places disponibles     │  │
│                           │  │ [Voir détails →]        │  │
│                           │  └──────────────────────────┘  │
│                           │                                  │
│                           │  [...autres résultats...]        │
│                           │                                  │
│                           │  [1] [2] [3] [Suivant →]        │
└───────────────────────────┴──────────────────────────────────┘
```

#### Éléments clés

**Sidebar gauche (Filtres)** :
- Titre "Filtres"
- Champ "Prix maximum" (input number)
- Champ "Durée maximale" (input number)
- Sélecteur "Note minimale" (radio buttons ou slider)
- Checkboxes "Type de véhicule" (Électrique, Hybride, GNV)
- Bouton "Appliquer les filtres"

**Zone principale (Résultats)** :
- Titre "Résultats (X covoiturages)"
- **Cartes de covoiturage** (répétées) :
  - Trajet : "Ville départ → Ville arrivée"
  - Date et heure : "20/01/2026 - 08:00"
  - Prix : "25 crédits/personne"
  - Conducteur : "Nom + étoiles"
  - Véhicule : "Modèle"
  - Places : "X places disponibles"
  - Bouton "Voir détails →"
- Pagination en bas (1, 2, 3, Suivant)

**Layout** :
- Sidebar fixe 300px largeur
- Zone résultats : largeur restante (1620px)
- Cartes en grille 2 colonnes

---

### 2.3 Wireframe Desktop - Détail covoiturage

#### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo EcoRide]    Accueil  Rechercher  Profil  [Jean Dupont]│
├─────────────────────────────────────────────────────────────┤
│ < Retour aux résultats                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────┐  ┌─────────────────┐  │
│  │ INFORMATIONS DU TRAJET          │  │ RÉSERVATION     │  │
│  │                                 │  │                 │  │
│  │ Paris → Lyon                    │  │ Prix : 25 €     │  │
│  │ 📅 20/01/2026                   │  │ Places : 3      │  │
│  │ ⏰ 08:00                         │  │                 │  │
│  │ 💳 25 crédits/personne          │  │ Votre solde :   │  │
│  │ 📍 3 places disponibles         │  │ 100 crédits     │  │
│  │ ⏱ Durée estimée : 4h30          │  │                 │  │
│  │                                 │  │ [Participer >]  │  │
│  └─────────────────────────────────┘  └─────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────┐                        │
│  │ CONDUCTEUR                      │                        │
│  │                                 │                        │
│  │ [Avatar] Jean Dupont            │                        │
│  │ ⭐⭐⭐⭐⭐ 4.5/5 (12 avis)      │                        │
│  │ Membre depuis 2024              │                        │
│  │                                 │                        │
│  │ [Voir tous les avis →]         │                        │
│  └─────────────────────────────────┘                        │
│                                                               │
│  ┌─────────────────────────────────┐                        │
│  │ VÉHICULE                        │                        │
│  │                                 │                        │
│  │ 🚗 Tesla Model 3                │                        │
│  │ 🔋 Électrique                   │                        │
│  │ ⚡ 15 kWh/100km                 │                        │
│  │ 💺 4 places au total            │                        │
│  └─────────────────────────────────┘                        │
│                                                               │
│  ┌─────────────────────────────────┐                        │
│  │ PRÉFÉRENCES                     │                        │
│  │                                 │                        │
│  │ 🎵 Musique : Autorisée          │                        │
│  │ 🐶 Animaux : Non                │                        │
│  │ 🧳 Bagages : Petits uniquement  │                        │
│  │ 🚭 Fumeur : Non                 │                        │
│  └─────────────────────────────────┘                        │
│                                                               │
│  ┌─────────────────────────────────┐                        │
│  │ AVIS DES PASSAGERS              │                        │
│  │                                 │                        │
│  │ ⭐⭐⭐⭐⭐ Marie L.              │                        │
│  │ "Excellent conducteur, très     │                        │
│  │ ponctuel et agréable."          │                        │
│  │ 15/01/2026                      │                        │
│  │                                 │                        │
│  │ ⭐⭐⭐⭐ Pierre D.               │                        │
│  │ "Très bon trajet, voiture       │                        │
│  │ confortable."                   │                        │
│  │ 10/01/2026                      │                        │
│  │                                 │                        │
│  │ [Voir tous les avis (12) →]    │                        │
│  └─────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

#### Éléments clés

**Breadcrumb** :
- "< Retour aux résultats"

**Layout 2 colonnes** :

**Colonne gauche (70%)** :
- **Carte "Informations du trajet"** :
  - Trajet (départ → arrivée)
  - Date, heure
  - Prix
  - Places disponibles
  - Durée estimée

- **Carte "Conducteur"** :
  - Avatar (placeholder cercle)
  - Nom
  - Note moyenne + nombre d'avis
  - Membre depuis
  - Lien "Voir tous les avis"

- **Carte "Véhicule"** :
  - Modèle
  - Type d'énergie
  - Consommation
  - Nombre de places

- **Carte "Préférences"** :
  - Musique
  - Animaux
  - Bagages
  - Fumeur

- **Carte "Avis des passagers"** :
  - Liste de 2-3 avis (preview)
  - Lien "Voir tous les avis"

**Colonne droite (30%)** :
- **Carte "Réservation"** (sticky) :
  - Prix récapitulatif
  - Places disponibles
  - Solde de l'utilisateur
  - Bouton CTA "Participer"

---

### 2.4 Wireframe Mobile - Page d'accueil

#### Dimensions
- **Largeur** : 375px (iPhone SE)
- **Hauteur** : ~812px (variable)

#### Structure

```
┌───────────────────┐
│ ☰  [Logo] 👤 100€ │
├───────────────────┤
│                   │
│  PARTAGEZ VOS     │
│    TRAJETS,       │
│   RÉDUISEZ VOTRE  │
│   EMPREINTE       │
│                   │
│ ┌───────────────┐ │
│ │ Départ :      │ │
│ │ [___________] │ │
│ │               │ │
│ │ Arrivée :     │ │
│ │ [___________] │ │
│ │               │ │
│ │ Date :        │ │
│ │ [__/__/____]  │ │
│ │               │ │
│ │ [Rechercher>] │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │   💰          │ │
│ │ Économique    │ │
│ │ [Texte...]    │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │   🌱          │ │
│ │ Écologique    │ │
│ │ [Texte...]    │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │   🔒          │ │
│ │  Sécurisé     │ │
│ │ [Texte...]    │ │
│ └───────────────┘ │
│                   │
│ Comment ça marche?│
│ 1. Recherchez     │
│ 2. Réservez       │
│ 3. Voyagez        │
│ 4. Avis           │
│                   │
│ Footer            │
└───────────────────┘
```

#### Éléments clés

**Header mobile** :
- Hamburger menu (☰) à gauche
- Logo centré ou à côté du menu
- Icône profil (👤) + solde (100€) à droite

**Hero section** :
- Titre adapté (2-3 lignes)
- **Barre de recherche verticale** :
  - Champs empilés (départ, arrivée, date)
  - Bouton pleine largeur

**Features** :
- Cartes empilées verticalement (pas côte à côte)
- Icône + titre + texte

**How it works** :
- Liste simplifiée

---

### 2.5 Wireframe Mobile - Page de recherche

#### Structure

```
┌───────────────────┐
│ < Filtres  [Logo] │
├───────────────────┤
│ Résultats (12)    │
│                   │
│ ┌───────────────┐ │
│ │Paris → Lyon   │ │
│ │20/01 - 08:00  │ │
│ │25 crédits     │ │
│ │Jean D. ⭐⭐⭐ │ │
│ │Tesla Model 3  │ │
│ │3 places       │ │
│ │[Détails →]   │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │Lyon → Mars.   │ │
│ │21/01 - 14:30  │ │
│ │30 crédits     │ │
│ │Marie D. ⭐⭐⭐│ │
│ │Renault Zoe    │ │
│ │2 places       │ │
│ │[Détails →]   │ │
│ └───────────────┘ │
│                   │
│ [...autres]       │
│                   │
│ [1][2][3][>]      │
└───────────────────┘
```

#### Éléments clés

**Header** :
- Bouton "< Filtres" (ouvre un drawer latéral)
- Titre "Résultats (X)"

**Cartes** :
- Version compacte
- Informations essentielles
- Bouton "Détails"

**Pagination** :
- Adaptée mobile (plus petite)

---

### 2.6 Wireframe Mobile - Détail covoiturage

#### Structure

```
┌───────────────────┐
│ < Retour  [Logo]  │
├───────────────────┤
│                   │
│ Paris → Lyon      │
│ 📅 20/01 - 08:00  │
│ 💳 25 crédits     │
│ 📍 3 places       │
│                   │
│ ┌───────────────┐ │
│ │ CONDUCTEUR    │ │
│ │ [Avatar]      │ │
│ │ Jean Dupont   │ │
│ │ ⭐⭐⭐⭐⭐ 4.5│ │
│ │ (12 avis)     │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ VÉHICULE      │ │
│ │ 🚗 Tesla M3   │ │
│ │ 🔋 Électrique │ │
│ │ 15 kWh/100km  │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ PRÉFÉRENCES   │ │
│ │ 🎵 Musique OK │ │
│ │ 🐶 Animaux Non│ │
│ │ 🧳 Petits bag.│ │
│ │ 🚭 Non fumeur │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ AVIS (12)     │ │
│ │ ⭐⭐⭐⭐⭐     │ │
│ │ "Excellent..."│ │
│ │ Marie L.      │ │
│ │               │ │
│ │ [Voir tout →]│ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ Votre solde:  │ │
│ │ 100 crédits   │ │
│ │ Prix: 25 cr.  │ │
│ │               │ │
│ │[Participer >] │ │
│ └───────────────┘ │
└───────────────────┘
```

#### Éléments clés

**Layout vertical** :
- Toutes les cartes empilées
- Carte "Réservation" en bas (sticky ou fixed)

**Contenu adapté** :
- Informations condensées
- Icônes pour gagner de la place

---

## 3. Mockups requis

### 3.1 Mockup Desktop - Page d'accueil

#### Différences avec le wireframe

**À ajouter** :
- **Couleurs** : Palette EcoRide (vert #28a745, blanc, gris)
- **Images** :
  - Photo hero (paysage + voiture ou personnes heureuses)
  - Icônes colorées (💰→ icône verte, 🌱→ feuille, 🔒→ cadenas)
- **Typographie** : Roboto
- **Ombres** : Sur les cartes (box-shadow)
- **Espacement** : Padding et margins réels
- **Logo** : Logo EcoRide avec feuille verte

**Détails visuels** :
- Navbar : fond blanc, bordure grise en bas
- Hero : photo en arrière-plan avec overlay semi-transparent
- Barre de recherche : ombre portée, bordures arrondies
- Cartes features : fond blanc, ombre légère, icônes vertes
- Boutons : vert principal avec hover foncé

---

### 3.2 Mockup Desktop - Page de recherche

**À ajouter** :
- **Cartes de covoiturage** :
  - Fond blanc
  - Ombre au survol
  - Badge "Électrique" en vert
  - Avatar du conducteur (photo placeholder)
  - Étoiles en or
- **Filtres** :
  - Checkboxes stylisées
  - Slider pour la note
- **Pagination** :
  - Boutons arrondis
  - Actif en vert

---

### 3.3 Mockup Desktop - Détail covoiturage

**À ajouter** :
- **Avatar conducteur** : Photo ronde
- **Carte réservation** : Fond vert clair, bouton vert foncé
- **Badges** : "Électrique" en vert, "3 places" en bleu
- **Liste avis** : Étoiles en or, dates en gris
- **Icônes** : Font Awesome colorées

---

### 3.4 Mockups Mobile

Mêmes ajouts que desktop mais :
- **Layout responsive**
- **Tailles de police adaptées**
- **Touch targets** : 44px minimum
- **Espacement accru** entre éléments

---

## 4. Outils recommandés

### Figma (recommandé)

**Pourquoi Figma ?**
- Gratuit pour usage personnel
- Collaboratif (partage facile)
- Templates disponibles
- Export PDF/PNG facile

**Installation** :
- Web : https://www.figma.com
- Desktop : Télécharger l'app
- Créer un compte gratuit

**Plugins utiles** :
- **Unsplash** : Photos gratuites
- **Iconify** : Bibliothèque d'icônes
- **Lorem Ipsum** : Texte de remplissage

### Alternatives

- **Adobe XD** : Gratuit, Adobe Creative Cloud
- **Sketch** : macOS uniquement, payant
- **Balsamiq** : Spécialisé wireframes (payant)
- **Pencil Project** : Open source, gratuit

### Export

**Pour l'ECF, exporter en** :
- **PDF** : Un fichier par page (accueil_desktop.pdf, etc.)
- **PNG** : Haute résolution (2x, 300 DPI)

---

## 5. Guide de création pas à pas

### Étape 1 : Créer le projet Figma

1. Ouvrir Figma
2. Cliquer sur "New Design File"
3. Renommer : "EcoRide - Maquettes ECF"

### Étape 2 : Créer les frames

**Pour Desktop** :
- Cliquer sur "Frame" (F)
- Sélectionner "Desktop" → 1920x1080
- Renommer : "Accueil - Desktop - Wireframe"

**Pour Mobile** :
- Sélectionner "Phone" → iPhone SE (375x667)
- Renommer : "Accueil - Mobile - Wireframe"

**Répéter** pour les 6 wireframes (3 desktop + 3 mobile)

### Étape 3 : Wireframes (basse fidélité)

**Palette** :
- Noir : #000000 (texte)
- Gris : #666666 (bordures)
- Blanc : #FFFFFF (fond)

**Éléments** :
- **Rectangles** (R) pour les cartes
- **Texte** (T) pour les labels
- **Lignes** (L) pour les bordures
- Pas d'images, juste des placeholders `[Image]`

**Exemple bouton wireframe** :
```
┌─────────────┐
│ Rechercher  │
└─────────────┘
```
Bordure grise, fond blanc, texte noir

### Étape 4 : Mockups (haute fidélité)

**Dupliquer les wireframes** :
- Sélectionner le frame
- Cmd/Ctrl + D
- Renommer : "Accueil - Desktop - Mockup"

**Appliquer la charte** :

1. **Couleurs** :
   - Fond navbar : #FFFFFF
   - Boutons CTA : #28a745
   - Texte : #212529
   - Fond page : #f8f9fa

2. **Typographie** :
   - Police : Roboto (Google Fonts)
   - Titres : Roboto Bold
   - Corps : Roboto Regular

3. **Images** :
   - Plugin Unsplash
   - Rechercher : "carpool", "car", "happy people"
   - Insérer dans les placeholders

4. **Icônes** :
   - Plugin Iconify
   - Rechercher Font Awesome icons
   - Couleur : #28a745

5. **Ombres** :
   - Sélectionner une carte
   - Effects → Drop Shadow
   - Y: 2, Blur: 8, Color: #000000 10%

6. **Bordures arrondies** :
   - Sélectionner un rectangle
   - Border radius : 5px (boutons), 8px (cartes)

### Étape 5 : Vérifications

**Checklist avant export** :

- [ ] 3 wireframes desktop (noir/blanc)
- [ ] 3 wireframes mobile (noir/blanc)
- [ ] 3 mockups desktop (couleurs)
- [ ] 3 mockups mobile (couleurs)
- [ ] Logo EcoRide visible
- [ ] Palette respectée
- [ ] Police Roboto utilisée
- [ ] Textes lisibles (pas de lorem ipsum trop long)
- [ ] Espacement cohérent

### Étape 6 : Export

**Méthode 1 : Export PNG** :
1. Sélectionner un frame
2. Clic droit → "Export..."
3. Format : PNG, 2x
4. Export

**Méthode 2 : Export PDF** :
1. File → Export Frames to PDF
2. Sélectionner tous les frames
3. Export

**Nomenclature** :
- `01_Accueil_Desktop_Wireframe.png`
- `02_Accueil_Mobile_Wireframe.png`
- `03_Accueil_Desktop_Mockup.png`
- `04_Accueil_Mobile_Mockup.png`
- `05_Recherche_Desktop_Wireframe.png`
- ... etc.

### Étape 7 : PDF final pour l'ECF

**Créer un document PDF unique** :
1. Utiliser un outil comme Adobe Acrobat ou Canva
2. Créer un document "Maquettes_EcoRide.pdf"
3. Page de garde :
   - Titre : "Maquettes et Wireframes - EcoRide"
   - Votre nom
   - Date
4. Table des matières
5. Insérer les 12 images (6 wireframes + 6 mockups)
6. Légendes sous chaque image

**Structure suggérée** :
```
Page 1  : Page de garde
Page 2  : Table des matières
Page 3  : Wireframe Desktop - Accueil
Page 4  : Wireframe Mobile - Accueil
Page 5  : Wireframe Desktop - Recherche
Page 6  : Wireframe Mobile - Recherche
Page 7  : Wireframe Desktop - Détail
Page 8  : Wireframe Mobile - Détail
Page 9  : Mockup Desktop - Accueil
Page 10 : Mockup Mobile - Accueil
Page 11 : Mockup Desktop - Recherche
Page 12 : Mockup Mobile - Recherche
Page 13 : Mockup Desktop - Détail
Page 14 : Mockup Mobile - Détail
Page 15 : Annexe (charte graphique résumée)
```

---

## Annexes

### Templates Figma disponibles

**Rechercher dans Figma Community** :
- "Carpool app template"
- "Travel app wireframe"
- "E-commerce wireframe kit"

**Adapter** pour EcoRide

### Exemples de textes

**Titre Hero** :
- "Partagez vos trajets, réduisez votre empreinte carbone"
- "Covoiturage écologique et économique"
- "Voyagez ensemble, préservez la planète"

**Features** :
- **Économique** : "Payez avec des crédits, pas d'argent réel"
- **Écologique** : "Privilégiez les véhicules électriques et hybrides"
- **Sécurisé** : "Système d'avis et de validation des utilisateurs"

### Conseils de design

**DOs** ✅ :
- Utiliser la palette de la charte
- Espacements cohérents (multiples de 8px)
- Contrastes WCAG AA minimum
- Hiérarchie visuelle claire (titres > sous-titres > texte)

**DON'Ts** ❌ :
- Ne pas utiliser trop de couleurs différentes
- Éviter les polices fantaisistes
- Ne pas surcharger les wireframes (rester simple)
- Ne pas oublier les états (hover, disabled) dans les mockups

---

**Document créé le 19 janvier 2026**
**Version 1.0**
**EcoRide - Guide de création des maquettes**
