using EcoRide.Backend.Models;

namespace EcoRide.Backend.Repositories;

public interface IVehicleRepository
{
    Task<Vehicle?> GetByIdAsync(int id);
    Task<List<Vehicle>> GetByUserAsync(int userId);
    Task<List<Brand>> GetAllBrandsAsync();
    Task<Vehicle> CreateAsync(Vehicle vehicle);
    Task<Vehicle> UpdateAsync(Vehicle vehicle);
    Task DeleteAsync(int id);
}
