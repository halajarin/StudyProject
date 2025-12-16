using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly EcoRideContext _context;

    public VehicleRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Vehicle?> GetByIdAsync(int id)
    {
        return await _context.Vehicles
            .Include(v => v.Brand)
            .FirstOrDefaultAsync(v => v.VehicleId == id);
    }

    public async Task<List<Vehicle>> GetByUserAsync(int userId)
    {
        return await _context.Vehicles
            .Include(v => v.Brand)
            .Where(v => v.UserId == userId)
            .ToListAsync();
    }

    public async Task<List<Brand>> GetAllBrandsAsync()
    {
        return await _context.Brands.OrderBy(m => m.Label).ToListAsync();
    }

    public async Task<Vehicle> CreateAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task<Vehicle> UpdateAsync(Vehicle vehicle)
    {
        _context.Vehicles.Update(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task DeleteAsync(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle != null)
        {
            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
        }
    }
}
