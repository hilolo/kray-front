using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using ImmoGest.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class MailerSendEmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiToken;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public MailerSendEmailService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiToken = configuration["MailerSend:AccessToken"];
            _fromEmail = configuration["MailerSend:FromEmail"] ?? "noreply@immogest.com";
            _fromName = configuration["MailerSend:FromName"] ?? "ImmoGest";

            // Set authorization header
            if (!string.IsNullOrEmpty(_apiToken))
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiToken}");
            }
            _httpClient.BaseAddress = new Uri("https://api.mailersend.com/v1/");
        }

        public async Task<Result> SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl)
        {
            try
            {
                var emailPayload = new
                {
                    from = new
                    {
                        email = _fromEmail,
                        name = _fromName
                    },
                    to = new[]
                    {
                        new { email = email }
                    },
                    subject = "Password Reset Request",
                    html = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <style>
                                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                                .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                                .button:hover {{ background-color: #0056b3; }}
                                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <h2>Password Reset Request</h2>
                                <p>Hello,</p>
                                <p>You have requested to reset your password. Click the button below to reset your password:</p>
                                <a href='{resetUrl}' class='button'>Reset Password</a>
                                <p>Or copy and paste this link into your browser:</p>
                                <p><a href='{resetUrl}'>{resetUrl}</a></p>
                                <p>This link will expire in 1 hour.</p>
                                <p>If you did not request a password reset, please ignore this email.</p>
                                <div class='footer'>
                                    <p>Best regards,<br>ImmoGest Team</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    ",
                    text = $@"
                        Password Reset Request

                        Hello,

                        You have requested to reset your password. Please click the following link to reset your password:

                        {resetUrl}

                        This link will expire in 1 hour.

                        If you did not request a password reset, please ignore this email.

                        Best regards,
                        ImmoGest Team
                    "
                };

                var json = JsonSerializer.Serialize(emailPayload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("email", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return Result.Success();
                }
                else
                {
                    return Result.Failure()
                        .WithCode("email_send_failed")
                        .WithMessage($"Failed to send email: {responseContent}");
                }
            }
            catch (Exception ex)
            {
                return Result.Failure()
                    .WithCode("email_send_error")
                    .WithMessage($"Error sending email: {ex.Message}");
            }
        }
    }
}

