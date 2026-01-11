using System.Net;
using System.Text.Json;
using EcoRide.Backend.Dtos.Common;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace EcoRide.Backend.WebApi.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IWebHostEnvironment env)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger = logger;
    private readonly IWebHostEnvironment _env = env;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Une erreur non gérée s'est produite");

        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            Message = exception.Message,
            StatusCode = (int)HttpStatusCode.InternalServerError,
            Path = context.Request.Path,
            Timestamp = DateTime.UtcNow
        };

        // Include detailed error information in development only
        if (_env.IsDevelopment())
        {
            errorResponse.Details = exception.StackTrace;
        }

        switch (exception)
        {
            case ValidationException validationException:
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = "Validation failed";
                errorResponse.ErrorType = "ValidationError";
                errorResponse.ValidationErrors = validationException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToList()
                    );
                break;

            case UnauthorizedAccessException:
                errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = "Accès non autorisé";
                errorResponse.ErrorType = "UnauthorizedError";
                break;

            case KeyNotFoundException:
                errorResponse.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.Message = "Ressource non trouvée";
                errorResponse.ErrorType = "NotFoundError";
                break;

            case ArgumentException:
            case InvalidOperationException:
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.ErrorType = "BadRequestError";
                break;

            case DbUpdateException dbUpdateException:
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.ErrorType = "DatabaseError";

                if (dbUpdateException.InnerException is PostgresException postgresException)
                {
                    errorResponse.Message = postgresException.SqlState switch
                    {
                        "23505" => "Cette valeur existe déjà dans la base de données. Veuillez utiliser une valeur unique.",
                        "23503" => "Cette opération viole une contrainte de référence. L'enregistrement est utilisé ailleurs.",
                        "23502" => "Un champ obligatoire est manquant.",
                        _ => "Une erreur de base de données s'est produite."
                    };
                }
                else
                {
                    errorResponse.Message = "Une erreur s'est produite lors de la sauvegarde des données.";
                }
                break;

            default:
                errorResponse.Message = "Une erreur interne s'est produite. Veuillez réessayer plus tard.";
                errorResponse.ErrorType = "InternalServerError";
                break;
        }

        response.StatusCode = errorResponse.StatusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        var result = JsonSerializer.Serialize(errorResponse, jsonOptions);
        await response.WriteAsync(result);
    }
}
