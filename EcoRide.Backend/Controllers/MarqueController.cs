using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarqueController : ControllerBase
{
    private readonly IVoitureRepository _voitureRepository;

    public MarqueController(IVoitureRepository voitureRepository)
    {
        _voitureRepository = voitureRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var marques = await _voitureRepository.GetAllMarquesAsync();
        return Ok(marques);
    }
}
