namespace EcoRide.Backend.Services;

public interface ILocalizationService
{
    string GetString(string key);
    string GetString(string key, params object[] args);
    void SetLanguage(string cultureName);
    string GetCurrentLanguage();
}
