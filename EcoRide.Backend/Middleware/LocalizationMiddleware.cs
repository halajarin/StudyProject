using EcoRide.Backend.Services;
using System.Globalization;

namespace EcoRide.Backend.Middleware;

public class LocalizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string[] _supportedLanguages = { "en", "fr" };
    private readonly string _defaultLanguage = "en";

    public LocalizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ILocalizationService localizationService)
    {
        var language = DetermineLanguage(context);
        localizationService.SetLanguage(language);

        await _next(context);
    }

    private string DetermineLanguage(HttpContext context)
    {
        // 1. Check query parameter (highest priority)
        if (context.Request.Query.TryGetValue("lang", out var langQuery))
        {
            var queryLang = langQuery.ToString().ToLower();
            if (_supportedLanguages.Contains(queryLang))
            {
                return queryLang;
            }
        }

        // 2. Check custom header
        if (context.Request.Headers.TryGetValue("X-Language", out var langHeader))
        {
            var headerLang = langHeader.ToString().ToLower();
            if (_supportedLanguages.Contains(headerLang))
            {
                return headerLang;
            }
        }

        // 3. Check Accept-Language header
        var acceptLanguage = context.Request.Headers["Accept-Language"].ToString();
        if (!string.IsNullOrEmpty(acceptLanguage))
        {
            var languages = acceptLanguage.Split(',')
                .Select(l => l.Split(';')[0].Trim())
                .Select(l => l.Length > 2 ? l.Substring(0, 2) : l)
                .Where(l => _supportedLanguages.Contains(l))
                .ToList();

            if (languages.Any())
            {
                return languages.First();
            }
        }

        // 4. Return default language
        return _defaultLanguage;
    }
}
