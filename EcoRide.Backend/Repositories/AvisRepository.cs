using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Repositories;

public class AvisRepository : IAvisRepository
{
    private readonly EcoRideContext _context;

    public AvisRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Avis?> GetByIdAsync(int id)
    {
        return await _context.Avis
            .Include(a => a.UtilisateurAuteur)
            .Include(a => a.UtilisateurCible)
            .Include(a => a.Covoiturage)
            .FirstOrDefaultAsync(a => a.AvisId == id);
    }

    public async Task<List<Avis>> GetByUtilisateurCibleAsync(int utilisateurId, string? statut = null)
    {
        var query = _context.Avis
            .Include(a => a.UtilisateurAuteur)
            .Include(a => a.UtilisateurCible)
            .Where(a => a.UtilisateurCibleId == utilisateurId);

        if (!string.IsNullOrEmpty(statut))
        {
            query = query.Where(a => a.Statut == statut);
        }

        return await query.OrderByDescending(a => a.DateCreation).ToListAsync();
    }

    public async Task<List<Avis>> GetPendingAvisAsync()
    {
        return await _context.Avis
            .Include(a => a.UtilisateurAuteur)
            .Include(a => a.UtilisateurCible)
            .Include(a => a.Covoiturage)
            .Where(a => a.Statut == "En attente")
            .OrderBy(a => a.DateCreation)
            .ToListAsync();
    }

    public async Task<Avis> CreateAsync(Avis avis)
    {
        _context.Avis.Add(avis);
        await _context.SaveChangesAsync();
        return avis;
    }

    public async Task<Avis> UpdateAsync(Avis avis)
    {
        _context.Avis.Update(avis);
        await _context.SaveChangesAsync();
        return avis;
    }

    public async Task DeleteAsync(int id)
    {
        var avis = await _context.Avis.FindAsync(id);
        if (avis != null)
        {
            _context.Avis.Remove(avis);
            await _context.SaveChangesAsync();
        }
    }
}
