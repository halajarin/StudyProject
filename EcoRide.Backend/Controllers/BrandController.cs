using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController : ControllerBase
{
    private readonly IVehicleRepository _vehicleRepository;

    public BrandController(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var brands = await _vehicleRepository.GetAllBrandsAsync();
        return Ok(brands);
    }
}
