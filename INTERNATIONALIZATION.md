# EcoRide Internationalization (i18n)

## Overview

EcoRide supports multiple languages with a complete internationalization system for both backend and frontend.

**Supported Languages:**
- English (en) - Default
- French (fr)

## Backend (.NET)

### Architecture

The backend uses a custom localization service with middleware to automatically detect and apply the user's preferred language.

#### Components

1. **ILocalizationService** (`Services/ILocalizationService.cs`)
   - Interface for localization operations
   - Methods: `GetString()`, `SetLanguage()`, `GetCurrentLanguage()`

2. **LocalizationService** (`Services/LocalizationService.cs`)
   - Implementation with embedded translation dictionaries
   - Supports EN and FR
   - Automatic fallback to English if translation not found

3. **LocalizationMiddleware** (`Middleware/LocalizationMiddleware.cs`)
   - Automatically detects language from:
     1. Query parameter (`?lang=fr`)
     2. Custom header (`X-Language: fr`)
     3. Accept-Language header
     4. Default to English

#### Usage in Controllers

```csharp
public class MyController : ControllerBase
{
    private readonly ILocalizationService _localization;

    public MyController(ILocalizationService localization)
    {
        _localization = localization;
    }

    [HttpPost]
    public IActionResult Create()
    {
        var message = _localization.GetString("carpool.created");
        return Ok(new { message });
    }
}
```

#### Translation Keys

All translation keys are defined in `LocalizationService.cs`:

**Authentication:**
- `auth.invalid_credentials`
- `auth.email_exists`
- `auth.user_created`
- `auth.login_success`

**Carpool:**
- `carpool.not_found`
- `carpool.participation_confirmed`
- `carpool.created`
- `carpool.started`

**User:**
- `user.not_found`
- `user.updated`
- `user.deactivated`

[See LocalizationService.cs for complete list]

### Adding New Translations

To add a new translation:

1. Open `EcoRide.Backend/Services/LocalizationService.cs`
2. Add the key-value pair to both `enTranslations` and `frTranslations`:

```csharp
// In enTranslations
{ "myfeature.success", "Feature completed successfully" }

// In frTranslations
{ "myfeature.success", "Fonctionnalité terminée avec succès" }
```

## Frontend (Angular)

### Architecture

The frontend uses **ngx-translate** for internationalization with JSON translation files.

#### Components

1. **TranslationService** (`services/translation.service.ts`)
   - Manages language selection
   - Stores preference in localStorage
   - Auto-detects browser language
   - Sets HTML lang attribute for accessibility

2. **LanguageSelectorComponent** (`components/language-selector/`)
   - UI component for switching languages
   - Shows active language
   - Can be placed anywhere in the app

3. **Translation Files** (`assets/i18n/`)
   - `en.json` - English translations
   - `fr.json` - French translations

#### Configuration

Configured in `app.config.ts` and `main.ts` using standalone Angular approach.

#### Usage in Components

```typescript
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <h1>{{ 'common.welcome' | translate }}</h1>
    <p>{{ 'carpool.search_title' | translate }}</p>
    <button>{{ 'common.search' | translate }}</button>
  `
})
export class MyComponent {
  constructor(private translation: TranslationService) {}

  changeToFrench() {
    this.translation.setLanguage('fr');
  }
}
```

#### Using Language Selector

```typescript
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

@Component({
  template: `
    <header>
      <app-language-selector></app-language-selector>
    </header>
  `,
  imports: [LanguageSelectorComponent]
})
export class HeaderComponent {}
```

### Translation File Structure

JSON files are organized by feature:

```json
{
  "common": {
    "welcome": "Welcome",
    "login": "Login",
    "logout": "Logout"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "search_carpool": "Search Carpool"
  },
  "carpool": {
    "search_title": "Search Carpools",
    "departure_city": "Departure city"
  }
}
```

### Adding New Translations

1. Open `EcoRide.Frontend/src/assets/i18n/en.json`
2. Add your translation key:

```json
{
  "myfeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

3. Add the same structure to `fr.json` with French text:

```json
{
  "myfeature": {
    "title": "Ma Fonctionnalité",
    "description": "Description de la fonctionnalité"
  }
}
```

### Translation with Parameters

```typescript
// In component
<p>{{ 'user.credits_count' | translate:{ count: 50 } }}</p>

// In translation file
{
  "user": {
    "credits_count": "{{count}} credits"  // EN
    "credits_count": "{{count}} crédits"  // FR
  }
}
```

## Database

### User Language Preference

Users' language preferences are stored in the database:

**Column:** `user.preferred_language`
- Type: VARCHAR(5)
- Default: 'en'
- Values: 'en', 'fr'

### Migration

For existing databases, run:

```sql
\c ecoride
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';
CREATE INDEX IF NOT EXISTS idx_user_preferred_language ON "user"(preferred_language);
```

Or apply: `Database/04_add_language_preference.sql`

## API Language Detection

The backend automatically detects language from HTTP requests in this priority order:

### 1. Query Parameter (Highest Priority)
```http
GET /api/carpool?lang=fr
```

### 2. Custom Header
```http
GET /api/carpool
X-Language: fr
```

### 3. Accept-Language Header
```http
GET /api/carpool
Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
```

### 4. Default (en)

## Frontend Language Detection

1. Check localStorage (`user_language`)
2. Check browser language
3. Default to English

## Best Practices

### General

1. **Use semantic keys**: `carpool.created` not `msg1`
2. **Group by feature**: Organize translations by domain
3. **Keep keys consistent**: Same structure in all languages
4. **Never hardcode text**: Always use translation keys
5. **Test in all languages**: Verify UI in both EN and FR

### Backend

1. **Use localization service**: Don't return hardcoded messages
2. **Keep backend messages short**: UI will handle formatting
3. **Use string formatting**: For dynamic values
   ```csharp
   _localization.GetString("user.has_credits", user.Credits)
   ```

### Frontend

1. **Use TranslateModule**: Import in all components
2. **Use translate pipe**: `{{ 'key' | translate }}`
3. **Provide TranslationService**: For programmatic access
4. **Use LanguageSelector**: In header or settings
5. **Test responsiveness**: Translations may be longer/shorter

## Adding a New Language

### Backend

1. Edit `LocalizationService.cs`:
```csharp
private void LoadTranslations()
{
    var esTranslations = new Dictionary<string, string>
    {
        { "auth.login_success", "Inicio de sesión exitoso" },
        // ... all keys
    };
    _translations["es"] = esTranslations;
}
```

2. Update `_supportedLanguages` in LocalizationMiddleware:
```csharp
private readonly string[] _supportedLanguages = { "en", "fr", "es" };
```

### Frontend

1. Create `src/assets/i18n/es.json` with all translations
2. Update `TranslationService.ts`:
```typescript
private readonly SUPPORTED_LANGUAGES = ['en', 'fr', 'es'];
```
3. Update `LanguageSelectorComponent`:
```typescript
getLanguageName(code: string): string {
  const names: { [key: string]: string } = {
    'en': 'English',
    'fr': 'Français',
    'es': 'Español'
  };
  return names[code] || code;
}
```

### Database

1. Ensure `preferred_language` column accepts the new code
2. Update any validation constraints if needed

## Testing

### Backend
```bash
# Test with different languages
curl -H "X-Language: fr" http://localhost:5000/api/carpool
curl "http://localhost:5000/api/carpool?lang=fr"
```

### Frontend
```typescript
// In component test
it('should display in French', () => {
  translationService.setLanguage('fr');
  fixture.detectChanges();
  expect(compiled.querySelector('h1')?.textContent).toContain('Bienvenue');
});
```

## Accessibility

- HTML `lang` attribute automatically set
- Screen readers announce content in correct language
- Language selector keyboard accessible
- ARIA labels should also be translated

## Performance

- **Backend**: Translations loaded once at startup (in-memory)
- **Frontend**: Translation files lazy-loaded via HTTP
- **Caching**: Browser caches translation JSON files
- **Bundle size**: ~10KB per language file

## Common Issues

### Translation not showing
1. Check key exists in translation file
2. Verify TranslateModule imported
3. Check browser console for errors

### Wrong language detected
1. Clear localStorage
2. Check Accept-Language header
3. Set language explicitly

### New translations not appearing
1. Clear browser cache
2. Rebuild Angular app
3. Restart backend service

## Resources

- [ngx-translate Documentation](https://github.com/ngx-translate/core)
- [.NET Globalization](https://docs.microsoft.com/en-us/dotnet/core/extensions/globalization)
- [W3C Internationalization](https://www.w3.org/International/)
