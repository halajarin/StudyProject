using EcoRide.Backend.Models;

namespace EcoRide.Backend.Repositories;

public interface IAvisRepository
{
    Task<Avis?> GetByIdAsync(int id);
    Task<List<Avis>> GetByUtilisateurCibleAsync(int utilisateurId, string? statut = null);
    Task<List<Avis>> GetPendingAvisAsync();
    Task<Avis> CreateAsync(Avis avis);
    Task<Avis> UpdateAsync(Avis avis);
    Task DeleteAsync(int id);
}
