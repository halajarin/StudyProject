using EcoRide.Backend.Models;

namespace EcoRide.Backend.Repositories;

public interface IVoitureRepository
{
    Task<Voiture?> GetByIdAsync(int id);
    Task<List<Voiture>> GetByUtilisateurAsync(int utilisateurId);
    Task<List<Marque>> GetAllMarquesAsync();
    Task<Voiture> CreateAsync(Voiture voiture);
    Task<Voiture> UpdateAsync(Voiture voiture);
    Task DeleteAsync(int id);
}
