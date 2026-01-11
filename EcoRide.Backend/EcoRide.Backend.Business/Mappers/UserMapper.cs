namespace EcoRide.Backend.Business.Mappers;

using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Dtos.User;

public static class UserMapper
{
    public static UserProfileDTO ToProfileDTO(this User user, List<string> roles, double averageRating = 0, int reviewCount = 0)
    {
        return new UserProfileDTO
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            LastName = user.LastName,
            FirstName = user.FirstName,
            Phone = user.Phone,
            Address = user.Address,
            BirthDate = user.BirthDate,
            Photo = user.Photo,
            Credits = user.Credits,
            Roles = roles,
            AverageRating = averageRating,
            ReviewCount = reviewCount
        };
    }
}
