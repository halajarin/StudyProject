# EcoRide Frontend Tests

Ce document décrit les tests unitaires pour le frontend EcoRide développé avec Angular 20.

## Framework de test

- **Jasmine** : Framework de test (inclus avec Angular)
- **Karma** : Test runner
- **Angular Testing Utilities** : TestBed, HttpClientTestingModule, etc.

## Structure des tests

Les fichiers de test suivent la convention Angular `.spec.ts` et sont situés à côté des fichiers source :

```
src/app/
├── components/
│   └── covoiturage/
│       └── create-covoiturage/
│           ├── create-covoiturage.component.ts
│           └── create-covoiturage.component.spec.ts  # 14 tests
├── services/
│   ├── auth.service.ts
│   └── auth.service.spec.ts                          # 12 tests
└── guards/
    ├── auth.guard.ts
    └── auth.guard.spec.ts                            # 12 tests
```

## Exécuter les tests

### Tous les tests
```bash
cd EcoRide.Frontend
ng test
```

### Tests en mode headless (CI/CD)
```bash
ng test --watch=false --browsers=ChromeHeadless
```

### Avec couverture de code
```bash
ng test --code-coverage --watch=false
```

Le rapport de couverture sera généré dans `coverage/ecoride-frontend/index.html`.

### Tests spécifiques
```bash
# Tester un seul fichier
ng test --include='**/create-covoiturage.component.spec.ts'

# Tester un seul test (via fdescribe ou fit dans le fichier)
```

## Couverture de test

### CreateCovoiturageComponent (14 tests)
- ✅ Création du composant
- ✅ Chargement des véhicules au démarrage
- ✅ Affichage erreur si aucun véhicule
- ✅ Gestion erreur chargement véhicules
- ✅ Valeurs par défaut du formulaire
- ✅ Création de covoiturage réussie
- ✅ Gestion erreur création
- ✅ Navigation après succès
- ✅ Nettoyage messages erreur/succès
- ✅ Rendu du formulaire avec tous les champs
- ✅ Bouton désactivé en chargement
- ✅ Affichage message erreur
- ✅ Affichage message succès
- ✅ Population dropdown véhicules

### AuthService (12 tests)
- ✅ Création du service
- ✅ Initialisation avec/sans utilisateur en localStorage
- ✅ Login réussi avec stockage token
- ✅ Gestion erreur login
- ✅ Inscription réussie avec stockage token
- ✅ Gestion erreur inscription
- ✅ Déconnexion et nettoyage
- ✅ Vérification rôle (3 scénarios)
- ✅ Getter token
- ✅ Observable currentUser

### Auth Guards (12 tests)

**authGuard (3 tests)**
- ✅ Accès autorisé si connecté
- ✅ Redirection login si non connecté
- ✅ Conservation returnUrl

**roleGuard (9 tests)**
- ✅ Accès autorisé avec bon rôle
- ✅ Accès autorisé avec un des rôles requis
- ✅ Redirection accueil si mauvais rôle
- ✅ Redirection login si non connecté
- ✅ Gestion rôles vides
- ✅ Rôles multiples
- ✅ Sensibilité à la casse

**Total : 38 tests frontend**

## Configuration de test

Le fichier `karma.conf.js` est généré automatiquement par Angular CLI. Configuration par défaut :

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    browsers: ['Chrome'],
    // ...
  });
};
```

## Bonnes pratiques appliquées

1. **Isolation** : Chaque test est indépendant avec `beforeEach()`
2. **Mocking** : Utilisation de `jasmine.createSpyObj()` pour les services
3. **TestBed** : Configuration du module de test pour chaque composant
4. **HttpClientTestingModule** : Test des appels HTTP sans vraie requête
5. **Async/done** : Gestion correcte des opérations asynchrones
6. **Nommage descriptif** : `should do something when condition`
7. **DOM Testing** : Vérification du rendu avec `fixture.nativeElement`

## Exemples de patterns

### Test d'un composant
```typescript
describe('MonComponent', () => {
  let component: MonComponent;
  let fixture: ComponentFixture<MonComponent>;
  let mockService: jasmine.SpyObj<MonService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('MonService', ['method']);

    await TestBed.configureTestingModule({
      imports: [MonComponent],
      providers: [
        { provide: MonService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonComponent);
    component = fixture.componentInstance;
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

### Test d'un service avec HTTP
```typescript
describe('MonService', () => {
  let service: MonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MonService]
    });

    service = TestBed.inject(MonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', (done) => {
    service.getData().subscribe(data => {
      expect(data).toEqual(expectedData);
      done();
    });

    const req = httpMock.expectOne('api/url');
    req.flush(expectedData);
  });
});
```

### Test d'un guard fonctionnel
```typescript
it('should allow access', () => {
  const result = TestBed.runInInjectionContext(() =>
    myGuard(mockRoute, mockState)
  );

  expect(result).toBe(true);
});
```

## CI/CD

Configuration pour intégration continue :

```yaml
# Exemple GitHub Actions
- name: Test Frontend
  run: |
    cd EcoRide.Frontend
    npm test -- --watch=false --browsers=ChromeHeadless --code-coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./EcoRide.Frontend/coverage/lcov.info
```

## Débogage des tests

### Dans le navigateur
1. Lancer `ng test`
2. Cliquer sur "DEBUG" dans la fenêtre Karma
3. Ouvrir les DevTools (F12)
4. Définir des breakpoints dans les fichiers `.spec.ts`

### Logs dans les tests
```typescript
it('should debug', () => {
  console.log('Debug value:', component.value);
  fixture.detectChanges();
  console.log('After detectChanges:', component.value);
});
```

## Métriques de qualité

Objectifs de couverture recommandés :
- **Statements** : > 80%
- **Branches** : > 75%
- **Functions** : > 80%
- **Lines** : > 80%

Vérifier avec :
```bash
ng test --code-coverage --watch=false
```

## Extensions de test recommandées

Pour étendre la couverture :

1. **Tests E2E** : Utiliser Cypress ou Playwright
2. **Tests d'intégration** : Tester les interactions entre composants
3. **Tests de performance** : Lighthouse CI
4. **Tests d'accessibilité** : axe-core

## Ressources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/)
