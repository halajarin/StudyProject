namespace EcoRide.Backend.Business.Helpers;

public interface ILocalizationHelper
{
    string GetString(string key);
    string GetString(string key, params object[] args);
    void SetLanguage(string cultureName);
    string GetCurrentLanguage();
}
