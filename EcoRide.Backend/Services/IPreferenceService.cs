using MongoDB.Bson;

namespace EcoRide.Backend.Services;

public interface IPreferenceService
{
    Task<BsonDocument?> GetPreferencesAsync(int utilisateurId);
    Task CreateOrUpdatePreferencesAsync(int utilisateurId, Dictionary<string, object> preferences);
    Task DeletePreferencesAsync(int utilisateurId);
}
