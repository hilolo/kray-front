using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs.User
{
    public class ForgotPasswordDto
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; }
    }
}

