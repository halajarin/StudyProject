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
            _logger.LogInformation($"Email envoyé à {toEmail} avec le sujet: {subject}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erreur lors de l'envoi de l'email: {ex.Message}");
            // En production, vous pourriez vouloir relancer l'exception ou la gérer différemment
        }
    }

    public async Task SendCovoiturageAnnulationAsync(string toEmail, string pseudo, string trajetInfo)
    {
        var subject = "Annulation de covoiturage - EcoRide";
        var body = $@"
            <html>
            <body>
                <h2>Bonjour {pseudo},</h2>
                <p>Nous vous informons que le covoiturage suivant a été annulé :</p>
                <p><strong>{trajetInfo}</strong></p>
                <p>Vos crédits ont été remboursés.</p>
                <p>Nous nous excusons pour ce désagrément.</p>
                <br>
                <p>L'équipe EcoRide</p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendCovoiturageTermineAsync(string toEmail, string pseudo, int covoiturageId)
    {
        var subject = "Covoiturage terminé - Veuillez donner votre avis - EcoRide";
        var body = $@"
            <html>
            <body>
                <h2>Bonjour {pseudo},</h2>
                <p>Le covoiturage #{covoiturageId} auquel vous avez participé est terminé.</p>
                <p>Veuillez vous rendre sur votre espace personnel pour :</p>
                <ul>
                    <li>Confirmer que tout s'est bien passé</li>
                    <li>Laisser un avis sur le chauffeur</li>
                </ul>
                <p>Votre retour est important pour maintenir la qualité de notre service.</p>
                <br>
                <p>L'équipe EcoRide</p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }
}
