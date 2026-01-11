namespace EcoRide.Backend.Business.Helpers;

public interface IEmailHelper
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendCarpoolCancellationAsync(string toEmail, string username, string tripInfo);
    Task SendCarpoolCompletedAsync(string toEmail, string username, int carpoolId);
}
