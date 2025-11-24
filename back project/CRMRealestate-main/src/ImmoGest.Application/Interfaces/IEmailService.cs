using System.Threading.Tasks;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IEmailService
    {
        Task<Result> SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl);
    }
}

