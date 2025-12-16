using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly EcoRideContext _context;

    public UserRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Vehicles)
                .ThenInclude(v => v.Brand)
            .FirstOrDefaultAsync(u => u.UserId == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }

    public async Task<List<string>> GetUserRolesAsync(int userId)
    {
        return await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role.Label)
            .ToListAsync();
    }

    public async Task AddUserRoleAsync(int userId, int roleId)
    {
        var userRole = new UserRole
        {
            UserId = userId,
            RoleId = roleId,
            AssignedAt = DateTime.UtcNow
        };
        _context.UserRoles.Add(userRole);
        await _context.SaveChangesAsync();
    }

    public async Task<double> GetAverageRatingAsync(int userId)
    {
        var reviews = await _context.Reviews
            .Where(a => a.TargetUserId == userId && a.Status == "Validated")
            .ToListAsync();

        return reviews.Any() ? reviews.Average(a => a.Note) : 0;
    }

    public async Task<int> GetRatingCountAsync(int userId)
    {
        return await _context.Reviews
            .CountAsync(a => a.TargetUserId == userId && a.Status == "Validated");
    }
}
