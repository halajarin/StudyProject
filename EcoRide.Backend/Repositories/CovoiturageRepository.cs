using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using EcoRide.Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Repositories;

public class CovoiturageRepository : ICovoiturageRepository
{
    private readonly EcoRideContext _context;

    public CovoiturageRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Covoiturage?> GetByIdAsync(int id)
    {
        return await _context.Covoiturages
            .Include(c => c.Voiture)
                .ThenInclude(v => v.Marque)
            .Include(c => c.Chauffeur)
            .Include(c => c.Participations)
                .ThenInclude(p => p.Passager)
            .FirstOrDefaultAsync(c => c.CovoiturageId == id);
    }

    public async Task<List<Covoiturage>> GetAllAsync()
    {
        return await _context.Covoiturages
            .Include(c => c.Voiture)
                .ThenInclude(v => v.Marque)
            .Include(c => c.Chauffeur)
            .OrderByDescending(c => c.DateCreation)
            .ToListAsync();
    }

    public async Task<List<Covoiturage>> SearchAsync(SearchCovoiturageDTO searchDto)
    {
        var query = _context.Covoiturages
            .Include(c => c.Voiture)
                .ThenInclude(v => v.Marque)
            .Include(c => c.Chauffeur)
            .Where(c => c.VilleDepart.ToLower() == searchDto.VilleDepart.ToLower() &&
                       c.VilleArrivee.ToLower() == searchDto.VilleArrivee.ToLower() &&
                       c.DateDepart.Date == searchDto.DateDepart.Date &&
                       c.NbPlaceRestante > 0 &&
                       c.Statut == "En attente");

        // Filtres optionnels
        if (searchDto.EstEcologique.HasValue && searchDto.EstEcologique.Value)
        {
            query = query.Where(c => c.Voiture.Energie.ToLower() == "electrique");
        }

        if (searchDto.PrixMax.HasValue)
        {
            query = query.Where(c => c.PrixPersonne <= searchDto.PrixMax.Value);
        }

        if (searchDto.DureeMaxMinutes.HasValue)
        {
            query = query.Where(c => c.DureeEstimeeMinutes <= searchDto.DureeMaxMinutes.Value);
        }

        return await query.OrderBy(c => c.DateDepart).ToListAsync();
    }

    public async Task<Covoiturage> CreateAsync(Covoiturage covoiturage)
    {
        _context.Covoiturages.Add(covoiturage);
        await _context.SaveChangesAsync();
        return covoiturage;
    }

    public async Task<Covoiturage> UpdateAsync(Covoiturage covoiturage)
    {
        _context.Covoiturages.Update(covoiturage);
        await _context.SaveChangesAsync();
        return covoiturage;
    }

    public async Task DeleteAsync(int id)
    {
        var covoiturage = await _context.Covoiturages.FindAsync(id);
        if (covoiturage != null)
        {
            _context.Covoiturages.Remove(covoiturage);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Covoiturage>> GetByDriverAsync(int utilisateurId)
    {
        return await _context.Covoiturages
            .Include(c => c.Voiture)
                .ThenInclude(v => v.Marque)
            .Include(c => c.Participations)
                .ThenInclude(p => p.Passager)
            .Where(c => c.UtilisateurId == utilisateurId)
            .OrderByDescending(c => c.DateDepart)
            .ToListAsync();
    }

    public async Task<List<Covoiturage>> GetByPassengerAsync(int utilisateurId)
    {
        return await _context.CovoiturageParticipations
            .Include(p => p.Covoiturage)
                .ThenInclude(c => c.Voiture)
                    .ThenInclude(v => v.Marque)
            .Include(p => p.Covoiturage)
                .ThenInclude(c => c.Chauffeur)
            .Where(p => p.UtilisateurId == utilisateurId)
            .Select(p => p.Covoiturage)
            .OrderByDescending(c => c.DateDepart)
            .ToListAsync();
    }

    public async Task<CovoiturageParticipation?> GetParticipationAsync(int covoiturageId, int utilisateurId)
    {
        return await _context.CovoiturageParticipations
            .FirstOrDefaultAsync(p => p.CovoiturageId == covoiturageId && p.UtilisateurId == utilisateurId);
    }

    public async Task<CovoiturageParticipation> AddParticipationAsync(CovoiturageParticipation participation)
    {
        _context.CovoiturageParticipations.Add(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    public async Task UpdateParticipationAsync(CovoiturageParticipation participation)
    {
        _context.CovoiturageParticipations.Update(participation);
        await _context.SaveChangesAsync();
    }

    public async Task<List<CovoiturageParticipation>> GetParticipationsAsync(int covoiturageId)
    {
        return await _context.CovoiturageParticipations
            .Include(p => p.Passager)
            .Where(p => p.CovoiturageId == covoiturageId)
            .ToListAsync();
    }

    public async Task<Dictionary<DateTime, int>> GetCovoituragesCountByDateAsync(DateTime startDate, DateTime endDate)
    {
        var covoiturages = await _context.Covoiturages
            .Where(c => c.DateCreation >= startDate && c.DateCreation <= endDate)
            .GroupBy(c => c.DateCreation.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        return covoiturages.ToDictionary(x => x.Date, x => x.Count);
    }

    public async Task<Dictionary<DateTime, float>> GetPlatformCreditsEarnedByDateAsync(DateTime startDate, DateTime endDate)
    {
        var participations = await _context.CovoiturageParticipations
            .Include(p => p.Covoiturage)
            .Where(p => p.DateParticipation >= startDate &&
                       p.DateParticipation <= endDate &&
                       p.Statut == "Validé")
            .GroupBy(p => p.DateParticipation.Date)
            .Select(g => new { Date = g.Key, Total = g.Sum(p => 2) }) // 2 crédits par participation
            .ToListAsync();

        return participations.ToDictionary(x => x.Date, x => (float)x.Total);
    }
}
