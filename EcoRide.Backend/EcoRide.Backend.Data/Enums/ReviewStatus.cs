namespace EcoRide.Backend.Data.Enums;

/// <summary>
/// Represents the validation status of a review
/// </summary>
public enum ReviewStatus
{
    /// <summary>
    /// Review is pending validation by an employee
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Review has been validated and is visible
    /// </summary>
    Validated = 1,

    /// <summary>
    /// Review has been rejected
    /// </summary>
    Rejected = 2
}
