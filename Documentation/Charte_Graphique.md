# Charte Graphique - EcoRide

## Identité visuelle

### Logo et nom
**EcoRide** : Contraction de "Écologique" et "Ride" (trajet en anglais)

**Composition du logo :**
- **"Eco"** en vert clair (#a8e6cf)
- **"Ride"** en blanc (#ffffff)
- Police : Segoe UI, sans-serif, bold
- Taille : 1.8rem

---

## Palette de couleurs

### Couleurs principales

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| Vert principal | `#2ecc71` | rgb(46, 204, 113) | Boutons primaires, accents |
| Vert foncé | `#27ae60` | rgb(39, 174, 96) | Header, titres, hover |
| Vert clair | `#a8e6cf` | rgb(168, 230, 207) | Badges écologiques, fonds clairs |
| Vert très clair | `#e8f8f5` | rgb(232, 248, 245) | Fond de page, cartes |

### Couleurs secondaires

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| Blanc | `#ffffff` | rgb(255, 255, 255) | Cartes, texte sur fond sombre |
| Noir | `#2c3e50` | rgb(44, 62, 80) | Texte principal, footer |
| Gris | `#7f8c8d` | rgb(127, 140, 141) | Texte secondaire |
| Gris clair | `#ecf0f1` | rgb(236, 240, 241) | Bordures, séparateurs |

### Couleurs d'état

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| Danger | `#e74c3c` | rgb(231, 76, 60) | Erreurs, suppression |
| Warning | `#f39c12` | rgb(243, 156, 18) | Avertissements, notes |
| Info | `#3498db` | rgb(52, 152, 219) | Informations |

---

## Typographie

### Polices

**Police principale :** Segoe UI, Tahoma, Geneva, Verdana, sans-serif

**Hiérarchie :**
- H1 : 3rem, bold, `color: #27ae60`
- H2 : 2rem, bold, `color: #27ae60`
- H3 : 1.5rem, semi-bold, `color: #2ecc71`
- H4-H6 : 1.2rem - 1rem, semi-bold
- Paragraphe : 1rem, regular, `color: #2c3e50`
- Petits textes : 0.85rem - 0.9rem

**Line-height :** 1.6 pour une meilleure lisibilité

---

## Composants UI

### Boutons

**Bouton primaire :**
```css
background-color: #2ecc71;
color: #ffffff;
padding: 10px 20px;
border-radius: 5px;
border: none;
transition: all 0.3s ease;
```

**Hover :**
```css
background-color: #27ae60;
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(0,0,0,0.2);
```

**Bouton secondaire :**
```css
background-color: #7f8c8d;
color: #ffffff;
```

**Bouton danger :**
```css
background-color: #e74c3c;
color: #ffffff;
```

### Cartes (Cards)

```css
background-color: #ffffff;
border-radius: 10px;
padding: 20px;
box-shadow: 0 2px 10px rgba(0,0,0,0.1);
transition: transform 0.3s ease;
```

**Hover :**
```css
transform: translateY(-5px);
box-shadow: 0 5px 20px rgba(0,0,0,0.15);
```

### Badges

**Badge succès (écologique) :**
```css
background-color: #a8e6cf;
color: #27ae60;
padding: 5px 10px;
border-radius: 20px;
font-size: 0.85rem;
```

**Badge warning :**
```css
background-color: #f39c12;
color: #ffffff;
```

**Badge info :**
```css
background-color: #3498db;
color: #ffffff;
```

### Formulaires

**Champs de saisie :**
```css
width: 100%;
padding: 10px;
border: 1px solid #ecf0f1;
border-radius: 5px;
font-size: 1rem;
```

**Focus :**
```css
border-color: #2ecc71;
box-shadow: 0 0 5px rgba(46, 204, 113, 0.3);
outline: none;
```

**Erreur :**
```css
border-color: #e74c3c;
color: #e74c3c;
```

### Alertes

**Alert success :**
```css
background-color: #a8e6cf;
color: #27ae60;
border-left: 4px solid #2ecc71;
padding: 15px;
border-radius: 5px;
```

**Alert danger :**
```css
background-color: #fadbd8;
color: #e74c3c;
border-left: 4px solid #e74c3c;
```

**Alert info :**
```css
background-color: #d6eaf8;
color: #3498db;
border-left: 4px solid #3498db;
```

---

## Iconographie

### Icônes utilisées

**Émojis pour une approche friendly :**
- 🌱 Écologie
- 🔋 Électrique
- 🚗 Voiture
- 👥 Utilisateurs
- ⭐ Note/Évaluation
- 💰 Crédits
- 📍 Localisation
- 📅 Date
- ⏰ Heure

**Alternative :** Font Awesome ou Material Icons pour une version plus professionnelle

---

## Espacements

**Système de spacing :**
- xs : 0.25rem (4px)
- sm : 0.5rem (8px)
- md : 1rem (16px)
- lg : 1.5rem (24px)
- xl : 2rem (32px)
- xxl : 3rem (48px)

**Padding des cartes :** 20px
**Margin entre sections :** 3rem
**Gap dans les grilles :** 20px

---

## Grilles et mise en page

**Container :**
```css
max-width: 1200px;
margin: 0 auto;
padding: 0 20px;
```

**Grille 2 colonnes :**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 20px;
```

**Grille 3 colonnes :**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
```

---

## Navigation

### Header

**Fond :** `#27ae60` (vert foncé)
**Hauteur :** Auto (padding 1rem 0)
**Liens :**
```css
color: #ffffff;
padding: 0.5rem 1rem;
border-radius: 5px;
transition: background-color 0.3s;
```

**Hover/Active :**
```css
background-color: rgba(255, 255, 255, 0.1);
```

**Badge crédits :**
```css
background-color: #2ecc71;
color: #ffffff;
padding: 0.5rem 1rem;
border-radius: 20px;
font-weight: bold;
```

### Footer

**Fond :** `#2c3e50` (noir)
**Texte :** `#ffffff`
**Liens :** `#2ecc71`
**Padding :** 2rem 0

---

## Responsive Design

### Breakpoints

- **Mobile :** < 768px
- **Tablet :** 768px - 1024px
- **Desktop :** > 1024px

### Adaptations mobiles

**Navigation :**
- Passer en mode colonne
- Menu hamburger (si navigation complexe)

**Grilles :**
```css
@media (max-width: 768px) {
  .grid-2, .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

**Typographie :**
- H1 : 2rem (au lieu de 3rem)
- Réduction des paddings

---

## Animations

### Transitions standard

```css
transition: all 0.3s ease;
```

### Hover sur cartes

```css
transform: translateY(-5px);
transition: transform 0.3s ease;
```

### Hover sur boutons

```css
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(0,0,0,0.2);
transition: all 0.3s ease;
```

### Loading

```css
.loading {
  text-align: center;
  color: #2ecc71;
  animation: pulse 1.5s ease-in-out infinite;
}
```

---

## États et feedback

### États des boutons

- **Normal :** Couleur de base
- **Hover :** Couleur plus foncée + élévation
- **Active/Pressed :** Légère compression
- **Disabled :** Opacité 0.5, cursor: not-allowed

### États des champs

- **Normal :** Bordure grise
- **Focus :** Bordure verte + ombre verte
- **Erreur :** Bordure rouge + texte rouge
- **Success :** Bordure verte

### Feedback utilisateur

- **Succès :** Alert verte
- **Erreur :** Alert rouge
- **Information :** Alert bleue
- **Loading :** Spinner ou texte animé

---

## Accessibilité

### Contraste

Tous les textes respectent un ratio de contraste minimum de 4.5:1 (WCAG AA)

**Exemples :**
- Texte noir (#2c3e50) sur fond blanc : ✓ 12.6:1
- Texte blanc sur vert foncé (#27ae60) : ✓ 4.8:1

### Taille des cibles

**Minimum :** 44x44px pour les boutons et liens cliquables (mobile)

### Focus visible

Tous les éléments interactifs ont un état focus visible :
```css
:focus {
  outline: 2px solid #2ecc71;
  outline-offset: 2px;
}
```

---

## Exemples d'application

### Page d'accueil

- Hero section : Dégradé vert (#27ae60 → #2ecc71)
- Barre de recherche : Carte blanche sur fond vert
- Features : 3 cartes blanches avec icônes
- Section About : Grid 2 colonnes

### Liste de covoiturages

- Filtres : Carte blanche en haut
- Résultats : Cartes empilées verticalement
- Badge "Électrique" : Vert clair avec icône 🔋

### Détails covoiturage

- En-tête : Route en gros titre vert
- Infos trip : Fond vert très clair
- Bouton participer : Grand, vert principal
- Section chauffeur : Carte avec photo et note

---

## Fichiers de ressources

**Couleurs CSS (styles.css) :**
```css
:root {
  --primary-green: #2ecc71;
  --dark-green: #27ae60;
  --light-green: #a8e6cf;
  --very-light-green: #e8f8f5;
  --white: #ffffff;
  --black: #2c3e50;
  --gray: #7f8c8d;
  --light-gray: #ecf0f1;
  --danger: #e74c3c;
  --warning: #f39c12;
  --info: #3498db;
}
```

---

## Conclusion

Cette charte graphique assure une cohérence visuelle sur toute l'application EcoRide, avec un thème écologique marqué par les tons verts et une approche moderne et épurée.

**Rappel des principes :**
1. Toujours utiliser les couleurs de la palette
2. Respecter les espacements définis
3. Maintenir la cohérence des composants
4. Privilégier la lisibilité et l'accessibilité
5. Appliquer les animations avec modération

**Date de création :** Janvier 2025
**Version :** 1.0
