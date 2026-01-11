using System.Net.Http.Json;
using EcoRide.Backend.Client.Interfaces;
using EcoRide.Backend.Dtos.Auth;
using EcoRide.Backend.Dtos.Carpool;
using EcoRide.Backend.Dtos.Review;
using EcoRide.Backend.Dtos.User;
using EcoRide.Backend.Dtos.Vehicle;

namespace EcoRide.Backend.Client;

/// <summary>
/// Implementation of the EcoRide client providing HTTP-based access to EcoRide services.
/// Inherits from a base client for common HTTP operations with automatic JSON serialization/deserialization.
/// </summary>
internal class EcoRideClient : IEcoRideClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private const string ClientName = "EcoRideClient";

    /// <summary>
    /// Initializes a new instance of the EcoRideClient.
    /// </summary>
    /// <param name="httpClientFactory">The HTTP client factory for creating HTTP client instances.</param>
    public EcoRideClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
    }

    /// <summary>
    /// Creates an HTTP client instance with the configured base address and settings.
    /// </summary>
    /// <returns>An HttpClient configured for EcoRide API calls.</returns>
    private HttpClient CreateClient() => _httpClientFactory.CreateClient(ClientName);

    public async Task<UserProfileDTO?> LoginAsync(
        LoginDTO login,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("auth/login", login, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<UserProfileDTO>(cancellationToken: cancellationToken);
    }

    public async Task<UserProfileDTO?> RegisterAsync(
        RegisterDTO register,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("auth/register", register, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<UserProfileDTO>(cancellationToken: cancellationToken);
    }

    public async Task<UserProfileDTO?> GetUserProfileAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.GetAsync($"users/{userId}", cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<UserProfileDTO>(cancellationToken: cancellationToken);
    }

    public async Task<UserProfileDTO?> UpdateUserProfileAsync(
        int userId,
        UpdateProfileDTO updateProfile,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PutAsJsonAsync($"users/{userId}", updateProfile, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<UserProfileDTO>(cancellationToken: cancellationToken);
    }

    public async Task<List<CarpoolDTO>?> GetCarpoolListingAsync(
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.GetAsync("carpools", cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<List<CarpoolDTO>>(cancellationToken: cancellationToken);
    }

    public async Task<List<CarpoolDTO>?> SearchCarpoolsAsync(
        SearchCarpoolDTO search,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("carpools/search", search, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<List<CarpoolDTO>>(cancellationToken: cancellationToken);
    }

    public async Task<CarpoolDTO?> GetCarpoolAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.GetAsync($"carpools/{id}", cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<CarpoolDTO>(cancellationToken: cancellationToken);
    }

    public async Task CreateCarpoolAsync(
        CreateCarpoolDTO carpool,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("carpools", carpool, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task UpdateCarpoolAsync(
        int id,
        CreateCarpoolDTO carpool,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PutAsJsonAsync($"carpools/{id}", carpool, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task DeleteCarpoolAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.DeleteAsync($"carpools/{id}", cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task JoinCarpoolAsync(
        int carpoolId,
        int seatsNeeded,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync(
            $"carpools/{carpoolId}/join",
            new { seatsNeeded },
            cancellationToken
        );
        response.EnsureSuccessStatusCode();
    }

    public async Task LeaveCarpoolAsync(
        int carpoolId,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync(
            $"carpools/{carpoolId}/leave",
            new { },
            cancellationToken
        );
        response.EnsureSuccessStatusCode();
    }

    public async Task<VehicleDTO?> CreateVehicleAsync(
        CreateVehicleDTO vehicle,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("vehicles", vehicle, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<VehicleDTO>(cancellationToken: cancellationToken);
    }

    public async Task<List<VehicleDTO>?> GetUserVehiclesAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.GetAsync($"users/{userId}/vehicles", cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<List<VehicleDTO>>(cancellationToken: cancellationToken);
    }

    public async Task DeleteVehicleAsync(
        int vehicleId,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.DeleteAsync($"vehicles/{vehicleId}", cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<ReviewDTO?> CreateReviewAsync(
        ReviewDTO review,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("reviews", review, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<ReviewDTO>(cancellationToken: cancellationToken);
    }

    public async Task<List<ReviewDTO>?> GetUserReviewsAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.GetAsync($"users/{userId}/reviews", cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<List<ReviewDTO>>(cancellationToken: cancellationToken);
    }

    public async Task DeleteReviewAsync(
        int reviewId,
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateClient();
        var response = await client.DeleteAsync($"reviews/{reviewId}", cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}
