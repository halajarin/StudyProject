using MongoDB.Bson;

namespace EcoRide.Backend.Business.Services.Interfaces;

public interface IPreferenceService
{
    Task<BsonDocument?> GetPreferencesAsync(int userId);
    Task CreateOrUpdatePreferencesAsync(int userId, Dictionary<string, object> preferences);
    Task DeletePreferencesAsync(int userId);
}
