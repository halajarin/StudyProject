using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Repositories;

public class UtilisateurRepository : IUtilisateurRepository
{
    private readonly EcoRideContext _context;

    public UtilisateurRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Utilisateur?> GetByIdAsync(int id)
    {
        return await _context.Utilisateurs
            .Include(u => u.UtilisateurRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Voitures)
                .ThenInclude(v => v.Marque)
            .FirstOrDefaultAsync(u => u.UtilisateurId == id);
    }

    public async Task<Utilisateur?> GetByEmailAsync(string email)
    {
        return await _context.Utilisateurs
            .Include(u => u.UtilisateurRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<Utilisateur?> GetByPseudoAsync(string pseudo)
    {
        return await _context.Utilisateurs
            .Include(u => u.UtilisateurRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Pseudo == pseudo);
    }

    public async Task<List<Utilisateur>> GetAllAsync()
    {
        return await _context.Utilisateurs
            .Include(u => u.UtilisateurRoles)
                .ThenInclude(ur => ur.Role)
            .ToListAsync();
    }

    public async Task<Utilisateur> CreateAsync(Utilisateur utilisateur)
    {
        _context.Utilisateurs.Add(utilisateur);
        await _context.SaveChangesAsync();
        return utilisateur;
    }

    public async Task<Utilisateur> UpdateAsync(Utilisateur utilisateur)
    {
        _context.Utilisateurs.Update(utilisateur);
        await _context.SaveChangesAsync();
        return utilisateur;
    }

    public async Task DeleteAsync(int id)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);
        if (utilisateur != null)
        {
            _context.Utilisateurs.Remove(utilisateur);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Utilisateurs.AnyAsync(u => u.Email == email);
    }

    public async Task<bool> PseudoExistsAsync(string pseudo)
    {
        return await _context.Utilisateurs.AnyAsync(u => u.Pseudo == pseudo);
    }

    public async Task<List<string>> GetUserRolesAsync(int utilisateurId)
    {
        return await _context.UtilisateurRoles
            .Where(ur => ur.UtilisateurId == utilisateurId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role.Libelle)
            .ToListAsync();
    }

    public async Task AddUserRoleAsync(int utilisateurId, int roleId)
    {
        var userRole = new UtilisateurRole
        {
            UtilisateurId = utilisateurId,
            RoleId = roleId,
            DateAttribution = DateTime.UtcNow
        };
        _context.UtilisateurRoles.Add(userRole);
        await _context.SaveChangesAsync();
    }

    public async Task<double> GetAverageRatingAsync(int utilisateurId)
    {
        var avis = await _context.Avis
            .Where(a => a.UtilisateurCibleId == utilisateurId && a.Statut == "Validé")
            .ToListAsync();

        return avis.Any() ? avis.Average(a => a.Note) : 0;
    }

    public async Task<int> GetRatingCountAsync(int utilisateurId)
    {
        return await _context.Avis
            .CountAsync(a => a.UtilisateurCibleId == utilisateurId && a.Statut == "Validé");
    }
}
