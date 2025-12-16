# EcoRide Backend Tests

Ce dossier contient les tests unitaires pour le backend EcoRide développé avec .NET 9.

## Framework de test

- **xUnit** : Framework de test unitaire
- **Moq** : Librairie de mocking
- **Entity Framework Core InMemory** : Base de données en mémoire pour les tests de repositories

## Structure des tests

```
EcoRide.Backend.Tests/
├── Services/
│   └── CovoiturageServiceTests.cs       # Tests du service métier
├── Controllers/
│   └── BaseControllerTests.cs           # Tests du contrôleur de base
└── Repositories/
    └── UtilisateurRepositoryTests.cs    # Tests du repository utilisateur
```

## Exécuter les tests

### Tous les tests
```bash
cd EcoRide.Backend.Tests
dotnet test
```

### Avec couverture de code
```bash
dotnet test --collect:"XPlat Code Coverage"
```

### Tests spécifiques
```bash
# Tester uniquement CovoiturageService
dotnet test --filter CovoiturageServiceTests

# Tester uniquement une méthode
dotnet test --filter "FullyQualifiedName~ParticiperAsync_ValidRequest_ReturnsSuccess"
```

### Mode verbose
```bash
dotnet test --logger "console;verbosity=detailed"
```

## Couverture de test

### CovoiturageServiceTests (13 tests)
- ✅ ParticiperAsync : 5 scénarios (covoiturage non trouvé, pas de place, utilisateur = chauffeur, crédit insuffisant, succès)
- ✅ AnnulerParticipationAsync : 2 scénarios (participation non trouvée, trajet déjà commencé)
- ✅ DemarrerCovoiturageAsync : 2 scénarios (pas le chauffeur, succès)
- ✅ TerminerCovoiturageAsync : 1 scénario (succès)

### BaseControllerTests (8 tests)
- ✅ GetCurrentUserId : 2 scénarios (valide, non autorisé)
- ✅ GetCurrentUserEmail : 2 scénarios (valide, non autorisé)
- ✅ GetCurrentUserName : 1 scénario
- ✅ UserHasRole : 3 scénarios (a le rôle, n'a pas le rôle, aucun rôle)

### UtilisateurRepositoryTests (12 tests)
- ✅ GetByIdAsync : 2 scénarios
- ✅ GetByEmailAsync : 2 scénarios
- ✅ GetByPseudoAsync : 1 scénario
- ✅ CreateAsync : 1 scénario
- ✅ UpdateAsync : 1 scénario
- ✅ GetAverageRatingAsync : 2 scénarios
- ✅ AddRoleAsync : 1 scénario
- ✅ HasRoleAsync : 2 scénarios

**Total : 33 tests backend**

## Bonnes pratiques appliquées

1. **AAA Pattern** : Arrange-Act-Assert dans chaque test
2. **Nommage descriptif** : `MethodName_Scenario_ExpectedResult`
3. **Isolation** : Chaque test est indépendant avec son propre setup
4. **Mocking** : Utilisation de Moq pour simuler les dépendances
5. **InMemory DB** : Base de données en mémoire pour tester les repositories
6. **Dispose Pattern** : Nettoyage des ressources après chaque test

## Ajouter de nouveaux tests

Pour ajouter des tests pour un nouveau service :

```csharp
public class MonServiceTests
{
    private readonly Mock<IDependency> _mockDependency;
    private readonly MonService _service;

    public MonServiceTests()
    {
        _mockDependency = new Mock<IDependency>();
        _service = new MonService(_mockDependency.Object);
    }

    [Fact]
    public async Task MaMethode_Scenario_ReturnExpected()
    {
        // Arrange
        _mockDependency.Setup(d => d.Method()).ReturnsAsync(value);

        // Act
        var result = await _service.MaMethode();

        // Assert
        Assert.Equal(expected, result);
    }
}
```

## CI/CD

Ces tests sont conçus pour être intégrés dans un pipeline CI/CD :

```yaml
# Exemple GitHub Actions
- name: Test Backend
  run: |
    cd EcoRide.Backend.Tests
    dotnet test --no-build --verbosity normal --collect:"XPlat Code Coverage"
```
