using Xunit;
using Moq;
using EcoRide.Backend.Services;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Models;
using Microsoft.Extensions.Logging;

namespace EcoRide.Backend.Tests.Services;

public class CovoiturageServiceTests
{
    private readonly Mock<ICovoiturageRepository> _mockCovoiturageRepo;
    private readonly Mock<IUtilisateurRepository> _mockUtilisateurRepo;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<ILogger<CovoiturageService>> _mockLogger;
    private readonly CovoiturageService _service;

    public CovoiturageServiceTests()
    {
        _mockCovoiturageRepo = new Mock<ICovoiturageRepository>();
        _mockUtilisateurRepo = new Mock<IUtilisateurRepository>();
        _mockEmailService = new Mock<IEmailService>();
        _mockLogger = new Mock<ILogger<CovoiturageService>>();

        _service = new CovoiturageService(
            _mockCovoiturageRepo.Object,
            _mockUtilisateurRepo.Object,
            _mockEmailService.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task ParticiperAsync_CovoiturageNotFound_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync((Covoiturage?)null);

        // Act
        var (success, message, credit) = await _service.ParticiperAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Covoiturage non trouvé", message);
        Assert.Null(credit);
    }

    [Fact]
    public async Task ParticiperAsync_NoPlaceAvailable_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            NbPlaceRestante = 0,
            PrixPersonne = 20
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);

        // Act
        var (success, message, credit) = await _service.ParticiperAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Plus de place disponible", message);
        Assert.Null(credit);
    }

    [Fact]
    public async Task ParticiperAsync_UserIsDriver_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = utilisateurId,
            NbPlaceRestante = 2,
            PrixPersonne = 20
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);

        // Act
        var (success, message, credit) = await _service.ParticiperAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Vous ne pouvez pas participer à votre propre covoiturage", message);
    }

    [Fact]
    public async Task ParticiperAsync_InsufficientCredits_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 2;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = 1,
            NbPlaceRestante = 2,
            PrixPersonne = 20,
            Statut = "En attente"
        };

        var utilisateur = new Utilisateur
        {
            UtilisateurId = utilisateurId,
            Credit = 10 // Insufficient
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);
        _mockUtilisateurRepo.Setup(r => r.GetByIdAsync(utilisateurId))
            .ReturnsAsync(utilisateur);

        // Act
        var (success, message, credit) = await _service.ParticiperAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Crédit insuffisant", message);
    }

    [Fact]
    public async Task ParticiperAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 2;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = 1,
            NbPlaceRestante = 2,
            NbPlace = 3,
            PrixPersonne = 20,
            Statut = "En attente"
        };

        var utilisateur = new Utilisateur
        {
            UtilisateurId = utilisateurId,
            Credit = 50,
            Email = "test@example.com"
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);
        _mockUtilisateurRepo.Setup(r => r.GetByIdAsync(utilisateurId))
            .ReturnsAsync(utilisateur);
        _mockCovoiturageRepo.Setup(r => r.AddParticipationAsync(It.IsAny<CovoiturageParticipation>()))
            .ReturnsAsync(new CovoiturageParticipation());
        _mockUtilisateurRepo.Setup(r => r.UpdateAsync(It.IsAny<Utilisateur>()))
            .ReturnsAsync(utilisateur);

        // Act
        var (success, message, credit) = await _service.ParticiperAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.True(success);
        Assert.Equal("Participation confirmée", message);
        Assert.Equal(30, credit); // 50 - 20 = 30
        Assert.Equal(30, utilisateur.Credit);
        Assert.Equal(1, covoiturage.NbPlaceRestante); // 2 - 1 = 1
    }

    [Fact]
    public async Task AnnulerParticipationAsync_ParticipationNotFound_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        _mockCovoiturageRepo.Setup(r => r.GetParticipationAsync(covoiturageId, utilisateurId))
            .ReturnsAsync((CovoiturageParticipation?)null);

        // Act
        var (success, message) = await _service.AnnulerParticipationAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Participation non trouvée", message);
    }

    [Fact]
    public async Task AnnulerParticipationAsync_TripAlreadyStarted_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        var participation = new CovoiturageParticipation
        {
            ParticipationId = 1,
            CovoiturageId = covoiturageId,
            UtilisateurId = utilisateurId
        };

        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            Statut = "En cours"
        };

        _mockCovoiturageRepo.Setup(r => r.GetParticipationAsync(covoiturageId, utilisateurId))
            .ReturnsAsync(participation);
        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);

        // Act
        var (success, message) = await _service.AnnulerParticipationAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Impossible d'annuler un trajet déjà commencé", message);
    }

    [Fact]
    public async Task DemarrerCovoiturageAsync_NotDriver_ReturnsFalse()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 2;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = 1 // Different user
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);

        // Act
        var (success, message) = await _service.DemarrerCovoiturageAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.False(success);
        Assert.Equal("Vous n'êtes pas le chauffeur de ce covoiturage", message);
    }

    [Fact]
    public async Task DemarrerCovoiturageAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = utilisateurId,
            Statut = "En attente"
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);
        _mockCovoiturageRepo.Setup(r => r.UpdateAsync(It.IsAny<Covoiturage>()))
            .ReturnsAsync(covoiturage);

        // Act
        var (success, message) = await _service.DemarrerCovoiturageAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.True(success);
        Assert.Equal("Covoiturage démarré", message);
        Assert.Equal("En cours", covoiturage.Statut);
    }

    [Fact]
    public async Task TerminerCovoiturageAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        int covoiturageId = 1;
        int utilisateurId = 1;
        var covoiturage = new Covoiturage
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = utilisateurId,
            Statut = "En cours"
        };

        _mockCovoiturageRepo.Setup(r => r.GetByIdAsync(covoiturageId))
            .ReturnsAsync(covoiturage);
        _mockCovoiturageRepo.Setup(r => r.UpdateAsync(It.IsAny<Covoiturage>()))
            .ReturnsAsync(covoiturage);

        // Act
        var (success, message) = await _service.TerminerCovoiturageAsync(covoiturageId, utilisateurId);

        // Assert
        Assert.True(success);
        Assert.Equal("Covoiturage terminé", message);
        Assert.Equal("Terminé", covoiturage.Statut);
    }
}
