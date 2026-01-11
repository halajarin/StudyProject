using Microsoft.AspNetCore.Mvc;

namespace EcoRide.Backend.WebApi.Controllers;

[Route("[controller]")]
[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
