using EcoRide.Backend.Data.Context;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Enums;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Data.Repositories;

public class CarpoolRepository : ICarpoolRepository
{
    private readonly EcoRideContext _context;

    public CarpoolRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Carpool?> GetByIdAsync(int id)
    {
        return await _context.Carpools
            .Include(c => c.Vehicle)
                .ThenInclude(v => v.Brand)
            .Include(c => c.Driver)
            .Include(c => c.Participations)
                .ThenInclude(p => p.Passenger)
            .FirstOrDefaultAsync(c => c.CarpoolId == id);
    }

    public async Task<List<Carpool>> GetAllAsync()
    {
        return await _context.Carpools
            .Include(c => c.Vehicle)
                .ThenInclude(v => v.Brand)
            .Include(c => c.Driver)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Carpool>> SearchAsync(
        string departureCity,
        string arrivalCity,
        DateTime? departureDate,
        bool? isEcological = null,
        float? maxPrice = null,
        int? maxDurationMinutes = null,
        int? minimumRating = null)
    {
        var query = _context.Carpools
            .Include(c => c.Vehicle)
                .ThenInclude(v => v.Brand)
            .Include(c => c.Driver)
            .Where(c => c.DepartureCity.ToLower() == departureCity.ToLower() &&
                       c.ArrivalCity.ToLower() == arrivalCity.ToLower() &&
                       c.AvailableSeats > 0 &&
                       c.Status == CarpoolStatus.Pending);

        // Optional date filter
        if (departureDate.HasValue)
        {
            var searchDate = DateTime.SpecifyKind(departureDate.Value.Date, DateTimeKind.Utc);
            query = query.Where(c => c.DepartureDate.Date == searchDate);
        }

        // Optional filters
        if (isEcological.HasValue && isEcological.Value)
        {
            query = query.Where(c => c.Vehicle.EnergyType == EnergyType.Electric);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(c => c.PricePerPerson <= maxPrice.Value);
        }

        if (maxDurationMinutes.HasValue)
        {
            query = query.Where(c => c.EstimatedDurationMinutes <= maxDurationMinutes.Value);
        }

        // Note: minimumRating filter would require Review data join if implemented

        return await query.OrderBy(c => c.DepartureDate).ToListAsync();
    }

    public async Task<Carpool> CreateAsync(Carpool carpool)
    {
        _context.Carpools.Add(carpool);
        await _context.SaveChangesAsync();
        return carpool;
    }

    public async Task<Carpool> UpdateAsync(Carpool carpool)
    {
        _context.Carpools.Update(carpool);
        await _context.SaveChangesAsync();
        return carpool;
    }

    public async Task DeleteAsync(int id)
    {
        var carpool = await _context.Carpools.FindAsync(id);
        if (carpool != null)
        {
            _context.Carpools.Remove(carpool);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Carpool>> GetByDriverAsync(int userId)
    {
        return await _context.Carpools
            .Include(c => c.Vehicle)
                .ThenInclude(v => v.Brand)
            .Include(c => c.Participations)
                .ThenInclude(p => p.Passenger)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.DepartureDate)
            .ToListAsync();
    }

    public async Task<List<Carpool>> GetByPassengerAsync(int userId)
    {
        return await _context.CarpoolParticipations
            .Include(p => p.Carpool)
                .ThenInclude(c => c.Vehicle)
                    .ThenInclude(v => v.Brand)
            .Include(p => p.Carpool)
                .ThenInclude(c => c.Driver)
            .Where(p => p.UserId == userId)
            .Select(p => p.Carpool)
            .OrderByDescending(c => c.DepartureDate)
            .ToListAsync();
    }

    public async Task<CarpoolParticipation?> GetParticipationAsync(int carpoolId, int userId)
    {
        return await _context.CarpoolParticipations
            .FirstOrDefaultAsync(p => p.CarpoolId == carpoolId && p.UserId == userId);
    }

    public async Task<CarpoolParticipation> AddParticipationAsync(CarpoolParticipation participation)
    {
        _context.CarpoolParticipations.Add(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    public async Task UpdateParticipationAsync(CarpoolParticipation participation)
    {
        _context.CarpoolParticipations.Update(participation);
        await _context.SaveChangesAsync();
    }

    public async Task<List<CarpoolParticipation>> GetParticipationsAsync(int carpoolId)
    {
        return await _context.CarpoolParticipations
            .Include(p => p.Passenger)
            .Where(p => p.CarpoolId == carpoolId)
            .ToListAsync();
    }

    public async Task<Dictionary<DateTime, int>> GetCarpoolsCountByDateAsync(DateTime startDate, DateTime endDate)
    {
        // Ensure dates are treated as UTC
        var start = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var carpools = await _context.Carpools
            .Where(c => c.CreatedAt >= start && c.CreatedAt <= end)
            .GroupBy(c => c.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        return carpools.ToDictionary(x => x.Date, x => x.Count);
    }

    public async Task<Dictionary<DateTime, float>> GetPlatformCreditsEarnedByDateAsync(DateTime startDate, DateTime endDate)
    {
        // Ensure dates are treated as UTC
        var start = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var participations = await _context.CarpoolParticipations
            .Include(p => p.Carpool)
            .Where(p => p.ParticipationDate >= start &&
                       p.ParticipationDate <= end &&
                       p.Status == ParticipationStatus.Validated)
            .GroupBy(p => p.ParticipationDate.Date)
            .Select(g => new { Date = g.Key, Total = g.Sum(p => 2) }) // 2 credits per participation
            .ToListAsync();

        return participations.ToDictionary(x => x.Date, x => (float)x.Total);
    }
}
