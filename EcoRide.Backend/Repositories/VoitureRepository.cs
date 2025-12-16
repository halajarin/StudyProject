using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Repositories;

public class VoitureRepository : IVoitureRepository
{
    private readonly EcoRideContext _context;

    public VoitureRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Voiture?> GetByIdAsync(int id)
    {
        return await _context.Voitures
            .Include(v => v.Marque)
            .FirstOrDefaultAsync(v => v.VoitureId == id);
    }

    public async Task<List<Voiture>> GetByUtilisateurAsync(int utilisateurId)
    {
        return await _context.Voitures
            .Include(v => v.Marque)
            .Where(v => v.UtilisateurId == utilisateurId)
            .ToListAsync();
    }

    public async Task<List<Marque>> GetAllMarquesAsync()
    {
        return await _context.Marques.OrderBy(m => m.Libelle).ToListAsync();
    }

    public async Task<Voiture> CreateAsync(Voiture voiture)
    {
        _context.Voitures.Add(voiture);
        await _context.SaveChangesAsync();
        return voiture;
    }

    public async Task<Voiture> UpdateAsync(Voiture voiture)
    {
        _context.Voitures.Update(voiture);
        await _context.SaveChangesAsync();
        return voiture;
    }

    public async Task DeleteAsync(int id)
    {
        var voiture = await _context.Voitures.FindAsync(id);
        if (voiture != null)
        {
            _context.Voitures.Remove(voiture);
            await _context.SaveChangesAsync();
        }
    }
}
