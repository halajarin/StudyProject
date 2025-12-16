using EcoRide.Backend.Models;

namespace EcoRide.Backend.Repositories;

public interface IUtilisateurRepository
{
    Task<Utilisateur?> GetByIdAsync(int id);
    Task<Utilisateur?> GetByEmailAsync(string email);
    Task<Utilisateur?> GetByPseudoAsync(string pseudo);
    Task<List<Utilisateur>> GetAllAsync();
    Task<Utilisateur> CreateAsync(Utilisateur utilisateur);
    Task<Utilisateur> UpdateAsync(Utilisateur utilisateur);
    Task DeleteAsync(int id);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> PseudoExistsAsync(string pseudo);
    Task<List<string>> GetUserRolesAsync(int utilisateurId);
    Task AddUserRoleAsync(int utilisateurId, int roleId);
    Task<double> GetAverageRatingAsync(int utilisateurId);
    Task<int> GetRatingCountAsync(int utilisateurId);
}
