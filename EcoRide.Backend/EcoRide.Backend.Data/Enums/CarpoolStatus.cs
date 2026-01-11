namespace EcoRide.Backend.Data.Enums;

/// <summary>
/// Represents the status of a carpool trip
/// </summary>
public enum CarpoolStatus
{
    /// <summary>
    /// Carpool is pending and accepting passengers
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Carpool trip is currently in progress
    /// </summary>
    InProgress = 1,

    /// <summary>
    /// Carpool trip has been completed
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Carpool has been cancelled by the driver
    /// </summary>
    Cancelled = 3
}
