using Microsoft.Extensions.DependencyInjection;
using EcoRide.Backend.Client.Interfaces;

namespace EcoRide.Backend.Client;

/// <summary>
/// Extension methods for adding the EcoRideClient to the DI container.
/// </summary>
public static class ServiceCollectionExtensions
{
    private const string BaseUrlKey = "Services:EcoRideClient:Url";
    private const string ClientName = "EcoRideClient";

    /// <summary>
    /// Adds the EcoRideClient to the DI container with proper HttpClient configuration.
    /// </summary>
    /// <param name="services">The <see cref="IServiceCollection"/>.</param>
    /// <param name="baseAddress">The base address for the EcoRide API. If not provided, uses configuration from Services:EcoRideClient:Url.</param>
    /// <returns>The <see cref="IServiceCollection"/> for method chaining.</returns>
    public static IServiceCollection AddEcoRideClient(
        this IServiceCollection services,
        string? baseAddress = null
    )
    {
        services.AddHttpClient(ClientName, client =>
        {
            if (!string.IsNullOrEmpty(baseAddress))
            {
                client.BaseAddress = new Uri(baseAddress);
            }
        });

        services.AddScoped<IEcoRideClient, EcoRideClient>();

        return services;
    }
}
