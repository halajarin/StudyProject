using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;
using BCrypt.Net;

namespace EcoRide.Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUtilisateurRepository utilisateurRepository, IConfiguration configuration)
    {
        _utilisateurRepository = utilisateurRepository;
        _configuration = configuration;
    }

    public async Task<(Utilisateur? user, string? token)> RegisterAsync(RegisterDTO registerDto)
    {
        // Vérifier si l'email existe déjà
        if (await _utilisateurRepository.EmailExistsAsync(registerDto.Email))
        {
            return (null, null);
        }

        // Vérifier si le pseudo existe déjà
        if (await _utilisateurRepository.PseudoExistsAsync(registerDto.Pseudo))
        {
            return (null, null);
        }

        // Créer l'utilisateur
        var utilisateur = new Utilisateur
        {
            Pseudo = registerDto.Pseudo,
            Email = registerDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Nom = registerDto.Nom ?? string.Empty,
            Prenom = registerDto.Prenom ?? string.Empty,
            Credit = 20, // 20 crédits à la création
            DateCreation = DateTime.UtcNow,
            EstActif = true
        };

        var createdUser = await _utilisateurRepository.CreateAsync(utilisateur);

        // Ajouter le rôle Passager par défaut (RoleId = 1)
        await _utilisateurRepository.AddUserRoleAsync(createdUser.UtilisateurId, 1);

        // Récupérer les rôles pour le token
        var roles = await _utilisateurRepository.GetUserRolesAsync(createdUser.UtilisateurId);

        // Générer le token JWT
        var token = GenerateJwtToken(createdUser, roles);

        return (createdUser, token);
    }

    public async Task<(Utilisateur? user, string? token)> LoginAsync(LoginDTO loginDto)
    {
        var utilisateur = await _utilisateurRepository.GetByEmailAsync(loginDto.Email);

        if (utilisateur == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, utilisateur.Password))
        {
            return (null, null);
        }

        if (!utilisateur.EstActif)
        {
            return (null, null);
        }

        var roles = await _utilisateurRepository.GetUserRolesAsync(utilisateur.UtilisateurId);
        var token = GenerateJwtToken(utilisateur, roles);

        return (utilisateur, token);
    }

    public string GenerateJwtToken(Utilisateur utilisateur, List<string> roles)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, utilisateur.UtilisateurId.ToString()),
            new Claim(ClaimTypes.Email, utilisateur.Email),
            new Claim(ClaimTypes.Name, utilisateur.Pseudo)
        };

        // Ajouter les rôles comme claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationInMinutes"]!)),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(secretKey),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
