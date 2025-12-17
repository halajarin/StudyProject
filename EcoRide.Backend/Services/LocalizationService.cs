using System.Globalization;
using System.Text.Json;

namespace EcoRide.Backend.Services;

public class LocalizationService : ILocalizationService
{
    private readonly Dictionary<string, Dictionary<string, string>> _translations;
    private string _currentLanguage;

    public LocalizationService()
    {
        _translations = new Dictionary<string, Dictionary<string, string>>();
        _currentLanguage = "en";
        LoadTranslations();
    }

    private void LoadTranslations()
    {
        // Load translations from embedded resources or files
        var enTranslations = new Dictionary<string, string>
        {
            // Authentication
            { "auth.invalid_credentials", "Invalid email or password" },
            { "auth.email_exists", "Email already exists" },
            { "auth.username_exists", "Username already exists" },
            { "auth.user_created", "User created successfully" },
            { "auth.login_success", "Login successful" },

            // Carpool
            { "carpool.not_found", "Carpool not found" },
            { "carpool.no_seats", "No seats available" },
            { "carpool.cannot_join_own", "You cannot join your own carpool" },
            { "carpool.insufficient_credits", "Insufficient credits" },
            { "carpool.already_participating", "You are already participating in this carpool" },
            { "carpool.participation_confirmed", "Participation confirmed" },
            { "carpool.participation_cancelled", "Participation cancelled and credits refunded" },
            { "carpool.created", "Carpool created successfully" },
            { "carpool.started", "Carpool started" },
            { "carpool.completed", "Carpool completed. Participants have been notified." },
            { "carpool.cancelled", "Carpool cancelled and participants refunded" },
            { "carpool.not_driver", "You are not the driver of this carpool" },
            { "carpool.cannot_start", "Carpool cannot be started" },
            { "carpool.not_in_progress", "Carpool is not in progress" },

            // Participation
            { "participation.not_found", "Participation not found" },
            { "participation.validated", "Trip validated" },
            { "participation.problem_reported", "Problem reported" },

            // Review
            { "review.not_found", "Review not found" },
            { "review.must_participate", "You must have participated in the carpool to leave a review" },
            { "review.must_validate", "You must first validate the trip" },
            { "review.created", "Review created successfully" },
            { "review.validated", "Review validated" },
            { "review.rejected", "Review rejected" },

            // User
            { "user.not_found", "User not found" },
            { "user.updated", "Profile updated successfully" },
            { "user.deactivated", "User deactivated" },
            { "user.reactivated", "User reactivated" },

            // Vehicle
            { "vehicle.created", "Vehicle added successfully" },
            { "vehicle.registration_exists", "Registration number already exists" },

            // Preferences
            { "preferences.saved", "Preferences saved successfully" },

            // General
            { "error.general", "An error occurred" },
            { "success.general", "Operation successful" }
        };

        var frTranslations = new Dictionary<string, string>
        {
            // Authentication
            { "auth.invalid_credentials", "Email ou mot de passe invalide" },
            { "auth.email_exists", "L'email existe déjà" },
            { "auth.username_exists", "Le nom d'utilisateur existe déjà" },
            { "auth.user_created", "Utilisateur créé avec succès" },
            { "auth.login_success", "Connexion réussie" },

            // Carpool
            { "carpool.not_found", "Covoiturage non trouvé" },
            { "carpool.no_seats", "Aucune place disponible" },
            { "carpool.cannot_join_own", "Vous ne pouvez pas rejoindre votre propre covoiturage" },
            { "carpool.insufficient_credits", "Crédits insuffisants" },
            { "carpool.already_participating", "Vous participez déjà à ce covoiturage" },
            { "carpool.participation_confirmed", "Participation confirmée" },
            { "carpool.participation_cancelled", "Participation annulée et crédits remboursés" },
            { "carpool.created", "Covoiturage créé avec succès" },
            { "carpool.started", "Covoiturage démarré" },
            { "carpool.completed", "Covoiturage terminé. Les participants ont été notifiés." },
            { "carpool.cancelled", "Covoiturage annulé et participants remboursés" },
            { "carpool.not_driver", "Vous n'êtes pas le conducteur de ce covoiturage" },
            { "carpool.cannot_start", "Le covoiturage ne peut pas être démarré" },
            { "carpool.not_in_progress", "Le covoiturage n'est pas en cours" },

            // Participation
            { "participation.not_found", "Participation non trouvée" },
            { "participation.validated", "Trajet validé" },
            { "participation.problem_reported", "Problème signalé" },

            // Review
            { "review.not_found", "Avis non trouvé" },
            { "review.must_participate", "Vous devez avoir participé au covoiturage pour laisser un avis" },
            { "review.must_validate", "Vous devez d'abord valider le trajet" },
            { "review.created", "Avis créé avec succès" },
            { "review.validated", "Avis validé" },
            { "review.rejected", "Avis rejeté" },

            // User
            { "user.not_found", "Utilisateur non trouvé" },
            { "user.updated", "Profil mis à jour avec succès" },
            { "user.deactivated", "Utilisateur désactivé" },
            { "user.reactivated", "Utilisateur réactivé" },

            // Vehicle
            { "vehicle.created", "Véhicule ajouté avec succès" },
            { "vehicle.registration_exists", "Numéro d'immatriculation déjà existant" },

            // Preferences
            { "preferences.saved", "Préférences enregistrées avec succès" },

            // General
            { "error.general", "Une erreur s'est produite" },
            { "success.general", "Opération réussie" }
        };

        _translations["en"] = enTranslations;
        _translations["fr"] = frTranslations;
    }

    public string GetString(string key)
    {
        if (_translations.TryGetValue(_currentLanguage, out var languageDict))
        {
            if (languageDict.TryGetValue(key, out var translation))
            {
                return translation;
            }
        }

        // Fallback to English if translation not found
        if (_currentLanguage != "en" && _translations["en"].TryGetValue(key, out var fallback))
        {
            return fallback;
        }

        return key; // Return the key itself if no translation found
    }

    public string GetString(string key, params object[] args)
    {
        var format = GetString(key);
        return string.Format(format, args);
    }

    public void SetLanguage(string cultureName)
    {
        if (_translations.ContainsKey(cultureName.ToLower()))
        {
            _currentLanguage = cultureName.ToLower();
            CultureInfo.CurrentCulture = new CultureInfo(cultureName);
            CultureInfo.CurrentUICulture = new CultureInfo(cultureName);
        }
    }

    public string GetCurrentLanguage()
    {
        return _currentLanguage;
    }
}
