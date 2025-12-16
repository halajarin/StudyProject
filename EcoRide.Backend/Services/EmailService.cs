using System.Net;
using System.Net.Mail;

namespace EcoRide.Backend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"]!);
            var senderEmail = emailSettings["SenderEmail"];
            var senderName = emailSettings["SenderName"];
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];

            using var smtpClient = new SmtpClient(smtpServer, smtpPort)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail!, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation($"Email sent to {toEmail} with subject: {subject}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending email: {ex.Message}");
            // In production, you might want to re-throw the exception or handle it differently
        }
    }

    public async Task SendCarpoolCancellationAsync(string toEmail, string username, string tripInfo)
    {
        var subject = "Carpool Cancellation - EcoRide";
        var body = $@"
            <html>
            <body>
                <h2>Hello {username},</h2>
                <p>We inform you that the following carpool has been cancelled:</p>
                <p><strong>{tripInfo}</strong></p>
                <p>Your credits have been refunded.</p>
                <p>We apologize for the inconvenience.</p>
                <br>
                <p>The EcoRide Team</p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendCarpoolCompletedAsync(string toEmail, string username, int carpoolId)
    {
        var subject = "Carpool Completed - Please Leave a Review - EcoRide";
        var body = $@"
            <html>
            <body>
                <h2>Hello {username},</h2>
                <p>Carpool #{carpoolId} that you participated in has been completed.</p>
                <p>Please visit your personal space to:</p>
                <ul>
                    <li>Confirm that everything went well</li>
                    <li>Leave a review for the driver</li>
                </ul>
                <p>Your feedback is important to maintain the quality of our service.</p>
                <br>
                <p>The EcoRide Team</p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }
}
