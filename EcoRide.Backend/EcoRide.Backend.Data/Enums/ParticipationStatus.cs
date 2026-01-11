namespace EcoRide.Backend.Data.Enums;

/// <summary>
/// Represents the status of a passenger's participation in a carpool
/// </summary>
public enum ParticipationStatus
{
    /// <summary>
    /// Participation is pending confirmation
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Participation has been confirmed
    /// </summary>
    Confirmed = 1,

    /// <summary>
    /// Participation has been cancelled
    /// </summary>
    Cancelled = 2,

    /// <summary>
    /// Trip has been validated by the passenger
    /// </summary>
    Validated = 3
}
