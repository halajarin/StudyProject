namespace EcoRide.Backend.Dtos.Common;

/// <summary>
/// Standardized error response for API errors
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// HTTP status code
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Error message for display
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Detailed error information (only in development)
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// Validation errors (field-level errors)
    /// </summary>
    public Dictionary<string, List<string>>? ValidationErrors { get; set; }

    /// <summary>
    /// Timestamp when the error occurred
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Error type/category
    /// </summary>
    public string? ErrorType { get; set; }

    /// <summary>
    /// Request path that caused the error
    /// </summary>
    public string? Path { get; set; }
}
