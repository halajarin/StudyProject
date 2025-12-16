namespace EcoRide.Backend.Services;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendCovoiturageAnnulationAsync(string toEmail, string pseudo, string trajetInfo);
    Task SendCovoiturageTermineAsync(string toEmail, string pseudo, int covoiturageId);
}
