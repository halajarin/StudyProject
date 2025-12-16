using MongoDB.Bson;

namespace EcoRide.Backend.Services;

public interface IPreferenceService
{
    Task<BsonDocument?> GetPreferencesAsync(int userId);
    Task CreateOrUpdatePreferencesAsync(int userId, Dictionary<string, object> preferences);
    Task DeletePreferencesAsync(int userId);
}
