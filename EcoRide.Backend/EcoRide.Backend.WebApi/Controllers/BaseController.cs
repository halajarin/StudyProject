using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcoRide.Backend.WebApi.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return int.Parse(userIdClaim);
    }

    protected string GetCurrentUserEmail()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
    }

    protected string GetCurrentUserName()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
    }

    protected bool UserHasRole(string role)
    {
        return User.IsInRole(role);
    }
}
