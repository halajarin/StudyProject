namespace EcoRide.Backend.Business.Services.Interfaces;

public interface IPreferenceService
{
    Task<Dictionary<string, object?>?> GetPreferencesAsync(int userId);
    Task CreateOrUpdatePreferencesAsync(int userId, Dictionary<string, object> preferences);
    Task DeletePreferencesAsync(int userId);
}
