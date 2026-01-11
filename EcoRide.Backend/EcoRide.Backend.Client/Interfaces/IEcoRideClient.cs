using EcoRide.Backend.Dtos.Auth;
using EcoRide.Backend.Dtos.Carpool;
using EcoRide.Backend.Dtos.Review;
using EcoRide.Backend.Dtos.User;
using EcoRide.Backend.Dtos.Vehicle;

namespace EcoRide.Backend.Client.Interfaces;

/// <summary>
/// Client interface for EcoRide operations providing access to user authentication, carpool listings,
/// searches, and vehicle management functionalities.
/// </summary>
public interface IEcoRideClient
{
    /// <summary>
    /// Authenticates a user with the provided login credentials.
    /// </summary>
    /// <param name="login">The login credentials containing email and password.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A UserProfileDTO containing the authenticated user's profile information, or null if login fails.</returns>
    Task<UserProfileDTO?> LoginAsync(
        LoginDTO login,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Registers a new user with the provided registration information.
    /// </summary>
    /// <param name="register">The registration information containing required user details.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A UserProfileDTO containing the newly registered user's profile information, or null if registration fails.</returns>
    Task<UserProfileDTO?> RegisterAsync(
        RegisterDTO register,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retrieves the user profile for a specific user by their ID.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A UserProfileDTO containing the user's profile information, or null if not found.</returns>
    Task<UserProfileDTO?> GetUserProfileAsync(
        int userId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates the user profile with the provided information.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to update.</param>
    /// <param name="updateProfile">The updated profile information.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>The updated UserProfileDTO, or null if the update fails.</returns>
    Task<UserProfileDTO?> UpdateUserProfileAsync(
        int userId,
        UpdateProfileDTO updateProfile,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retrieves a complete listing of all available carpools.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A collection of CarpoolDTO objects representing all available carpools, or null if no data is found.</returns>
    Task<List<CarpoolDTO>?> GetCarpoolListingAsync(
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Searches for carpools based on the provided search criteria.
    /// </summary>
    /// <param name="search">The search criteria including departure/arrival locations, dates, and other filters.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A collection of CarpoolDTO objects matching the search criteria, or null if no carpools are found.</returns>
    Task<List<CarpoolDTO>?> SearchCarpoolsAsync(
        SearchCarpoolDTO search,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retrieves a specific carpool by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the carpool to retrieve.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A CarpoolDTO containing the carpool details, or null if not found.</returns>
    Task<CarpoolDTO?> GetCarpoolAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Creates a new carpool with the provided information.
    /// </summary>
    /// <param name="carpool">The carpool information to create.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous create operation.</returns>
    Task CreateCarpoolAsync(
        CreateCarpoolDTO carpool,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates an existing carpool with the provided information.
    /// </summary>
    /// <param name="id">The unique identifier of the carpool to update.</param>
    /// <param name="carpool">The updated carpool information.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous update operation.</returns>
    Task UpdateCarpoolAsync(
        int id,
        CreateCarpoolDTO carpool,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes a carpool by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the carpool to delete.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous delete operation.</returns>
    Task DeleteCarpoolAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Joins a carpool for the authenticated user.
    /// </summary>
    /// <param name="carpoolId">The unique identifier of the carpool to join.</param>
    /// <param name="seatsNeeded">The number of seats needed for this carpool.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous join operation.</returns>
    Task JoinCarpoolAsync(
        int carpoolId,
        int seatsNeeded,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Leaves a carpool for the authenticated user.
    /// </summary>
    /// <param name="carpoolId">The unique identifier of the carpool to leave.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous leave operation.</returns>
    Task LeaveCarpoolAsync(
        int carpoolId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Creates a new vehicle for the authenticated user.
    /// </summary>
    /// <param name="vehicle">The vehicle information to create.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A VehicleDTO containing the created vehicle details, or null if creation fails.</returns>
    Task<VehicleDTO?> CreateVehicleAsync(
        CreateVehicleDTO vehicle,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retrieves all vehicles for a specific user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A collection of VehicleDTO objects for the user, or null if no vehicles are found.</returns>
    Task<List<VehicleDTO>?> GetUserVehiclesAsync(
        int userId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes a vehicle by its ID.
    /// </summary>
    /// <param name="vehicleId">The unique identifier of the vehicle to delete.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous delete operation.</returns>
    Task DeleteVehicleAsync(
        int vehicleId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Creates a review for a specific user.
    /// </summary>
    /// <param name="review">The review information to create.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A ReviewDTO containing the created review details, or null if creation fails.</returns>
    Task<ReviewDTO?> CreateReviewAsync(
        ReviewDTO review,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retrieves all reviews for a specific user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to get reviews for.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A collection of ReviewDTO objects for the user, or null if no reviews are found.</returns>
    Task<List<ReviewDTO>?> GetUserReviewsAsync(
        int userId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes a review by its ID.
    /// </summary>
    /// <param name="reviewId">The unique identifier of the review to delete.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation if needed.</param>
    /// <returns>A task representing the asynchronous delete operation.</returns>
    Task DeleteReviewAsync(
        int reviewId,
        CancellationToken cancellationToken = default
    );
}
