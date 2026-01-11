# Plan de Refactoring - Simplification & Nettoyage

## Problèmes Identifiés

### 1. Over-Engineering (43 fichiers → ~10 fichiers)
**Actuellement**: 39 classes Business (20 pour Carpool seul!)
- StartCarpool.cs (38 lignes) - Simple changement de statut
- CompleteCarpool.cs (56 lignes) - Simple changement de statut
- CancelCarpool.cs (57 lignes) - Simple changement de statut
- ValidateTrip.cs (60 lignes) - Simple validation
- ParticipateCarpool.cs (67 lignes) - Ajouter participation
- CancelParticipation.cs (52 lignes) - Supprimer participation
- DeletePreference.cs (22 lignes) - Simple suppression

**Problème**: Ces opérations sont trop simples pour justifier une classe + interface séparée.

### 2. Violation Architecture
**Data → Dtos dependency**
- `ICarpoolRepository.SearchAsync(SearchCarpoolDTO)` - Repository ne devrait PAS dépendre de DTOs
- Devrait retourner des entités, le mapping vers DTO se fait dans Business

### 3. Code Mort Probable
- Documentation files générés automatiquement (MIGRATION_SUMMARY.md, etc.)
- Interfaces avec une seule implémentation et une seule méthode
- Classes jamais utilisées par les controllers

## Solution: Retour à des Services Cohérents

### Architecture Simplifiée

```
Business/
├── Services/
│   ├── AuthService.cs           (Login, Register, GenerateJWT)
│   ├── CarpoolService.cs        (TOUT Carpool: CRUD, lifecycle, participation)
│   ├── PreferenceService.cs     (CRUD Preferences)
│   └── Interfaces/
│       ├── IAuthService.cs
│       ├── ICarpoolService.cs
│       └── IPreferenceService.cs
├── Helpers/
│   ├── EmailHelper.cs
│   └── LocalizationHelper.cs
└── Constants/
    └── RoleConstants.cs
```

**Résultat**: 3 services + 2 helpers = **5 fichiers** au lieu de 39!

### Mapping des Opérations

#### CarpoolService (au lieu de 10 classes)
```csharp
public interface ICarpoolService
{
    // Queries
    Task<CarpoolDTO?> GetByIdAsync(int id);
    Task<List<CarpoolDTO>> GetAllAsync();
    Task<List<CarpoolDTO>> SearchAsync(SearchCarpoolDTO search);
    Task<List<CarpoolDTO>> GetByDriverAsync(int userId);
    Task<List<CarpoolDTO>> GetByPassengerAsync(int userId);

    // Commands
    Task<CarpoolDTO> CreateAsync(CreateCarpoolDTO dto, int userId);
    Task<CarpoolDTO> UpdateAsync(int id, CreateCarpoolDTO dto);
    Task DeleteAsync(int id);

    // Lifecycle
    Task StartAsync(int id);
    Task CompleteAsync(int id);
    Task CancelAsync(int id);

    // Participation
    Task JoinAsync(int carpoolId, int userId, int seatsNeeded);
    Task LeaveAsync(int carpoolId, int userId);
    Task ValidateTripAsync(int participationId, bool isValidated, string? comment);
}
```

#### AuthService (au lieu de 3 classes)
```csharp
public interface IAuthService
{
    Task<(UserProfileDTO User, string Token)> LoginAsync(LoginDTO dto);
    Task<(UserProfileDTO User, string Token)> RegisterAsync(RegisterDTO dto);
}
// GenerateJwtToken devient une méthode privée
```

#### PreferenceService (au lieu de 3 classes)
```csharp
public interface IPreferenceService
{
    Task<PreferenceDTO?> GetAsync(int userId);
    Task<PreferenceDTO> UpsertAsync(int userId, PreferenceDTO dto);
    Task DeleteAsync(int userId);
}
```

## Corrections Architecture

### Fix Data→Dtos Dependency

**Avant** (MAUVAIS):
```csharp
// Repository dépend de DTO
public interface ICarpoolRepository
{
    Task<List<Carpool>> SearchAsync(SearchCarpoolDTO searchDto);
}
```

**Après** (BON):
```csharp
// Repository retourne seulement des entités
public interface ICarpoolRepository
{
    Task<List<Carpool>> SearchAsync(
        string departureCity,
        string arrivalCity,
        DateTime departureDate,
        bool? isEcological = null,
        float? maxPrice = null,
        int? maxDuration = null
    );
}

// Le service fait le mapping
public class CarpoolService
{
    public async Task<List<CarpoolDTO>> SearchAsync(SearchCarpoolDTO search)
    {
        var carpools = await _repository.SearchAsync(
            search.DepartureCity,
            search.ArrivalCity,
            search.DepartureDate,
            search.IsEcological,
            search.MaxPrice,
            search.MaxDurationMinutes
        );
        return carpools.Select(MapToDTO).ToList();
    }
}
```

## Mapping Entity→DTO (DRY)

Créer une classe de mapping pour éviter duplication:

```csharp
Business/Mappers/CarpoolMapper.cs

public static class CarpoolMapper
{
    public static CarpoolDTO ToDTO(this Carpool carpool)
    {
        return new CarpoolDTO
        {
            CarpoolId = carpool.CarpoolId,
            DepartureDate = carpool.DepartureDate,
            // ... mapping complet
            DriverUsername = carpool.Driver.Username,
            VehicleModel = carpool.Vehicle.Model,
            VehicleBrand = carpool.Vehicle.Brand.Label,
            // etc.
        };
    }
}
```

Usage: `var dto = carpool.ToDTO();`

## Nettoyage à Faire

### Fichiers à Supprimer
- [ ] Tous les fichiers Business/Carpool/* (sauf créer CarpoolService.cs)
- [ ] Tous les fichiers Business/Auth/* (sauf créer AuthService.cs)
- [ ] Tous les fichiers Business/Preference/* (sauf créer PreferenceService.cs)
- [ ] Business/MIGRATION_SUMMARY.md
- [ ] Business/QUICK_REFERENCE.md
- [ ] Business/ARCHITECTURE.md

### Fichiers à Garder/Renommer
- [ ] Utils/EmailHelper.cs → Helpers/EmailHelper.cs
- [ ] Utils/LocalizationHelper.cs → Helpers/LocalizationHelper.cs
- [ ] Constants/RoleConstants.cs (garder)

### Nouveaux Fichiers à Créer
- [ ] Business/Services/CarpoolService.cs
- [ ] Business/Services/AuthService.cs
- [ ] Business/Services/PreferenceService.cs
- [ ] Business/Services/Interfaces/ICarpoolService.cs
- [ ] Business/Services/Interfaces/IAuthService.cs
- [ ] Business/Services/Interfaces/IPreferenceService.cs
- [ ] Business/Mappers/CarpoolMapper.cs
- [ ] Business/Mappers/UserMapper.cs

## Avantages

✅ **Simplicité**: 5 fichiers au lieu de 39
✅ **Cohérence**: Retour à l'architecture du code original
✅ **Maintenabilité**: Tout le code Carpool au même endroit
✅ **DRY**: Mapping centralisé dans les Mappers
✅ **Clean Architecture**: Data ne dépend plus de Dtos
✅ **Pas d'over-engineering**: Services avec responsabilités claires

## Effort Estimé

- Suppression fichiers: 5 min
- Création CarpoolService: 30 min
- Création AuthService: 15 min
- Création PreferenceService: 10 min
- Création Mappers: 20 min
- Fix Repository signatures: 15 min
- Update Program.cs DI: 10 min
- Update Controllers: 20 min
- Tests compilation: 5 min

**Total: ~2h**
