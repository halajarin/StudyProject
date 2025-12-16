namespace EcoRide.Backend.Services;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendCarpoolCancellationAsync(string toEmail, string pseudo, string tripInfo);
    Task SendCarpoolCompletedAsync(string toEmail, string pseudo, int carpoolId);
}
