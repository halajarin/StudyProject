namespace EcoRide.Backend.Services;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendCarpoolCancellationAsync(string toEmail, string username, string tripInfo);
    Task SendCarpoolCompletedAsync(string toEmail, string username, int carpoolId);
}
