using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Dtos.Carpool;
using EcoRide.Backend.Dtos.Enums;

namespace EcoRide.Backend.Business.Mappers;

public static class CarpoolMapper
{
    public static CarpoolDTO ToDTO(this Carpool carpool)
    {
        return new CarpoolDTO
        {
            CarpoolId = carpool.CarpoolId,
            DepartureDate = carpool.DepartureDate,
            DepartureTime = carpool.DepartureTime,
            DepartureLocation = carpool.DepartureLocation,
            DepartureCity = carpool.DepartureCity,
            ArrivalDate = carpool.ArrivalDate,
            ArrivalTime = carpool.ArrivalTime,
            ArrivalLocation = carpool.ArrivalLocation,
            ArrivalCity = carpool.ArrivalCity,
            TotalSeats = carpool.TotalSeats,
            AvailableSeats = carpool.AvailableSeats,
            PricePerPerson = carpool.PricePerPerson,
            Status = carpool.Status.ToString(),
            EstimatedDurationMinutes = carpool.EstimatedDurationMinutes,
            IsEcological = carpool.Vehicle?.EnergyType == EnergyType.Electric,
            UserId = carpool.UserId,
            DriverUsername = carpool.Driver?.Username ?? string.Empty,
            DriverPhoto = carpool.Driver?.Photo,
            DriverAverageRating = 0, // Will be calculated separately if needed
            VehicleModel = carpool.Vehicle?.Model ?? string.Empty,
            VehicleBrand = carpool.Vehicle?.Brand?.Label ?? string.Empty,
            VehicleEnergyType = carpool.Vehicle?.EnergyType.ToString() ?? string.Empty,
            VehicleColor = carpool.Vehicle?.Color ?? string.Empty
        };
    }
}
