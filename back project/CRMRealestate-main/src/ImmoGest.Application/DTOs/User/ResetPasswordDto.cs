using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs.User
{
    public class ResetPasswordDto
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Token is required.")]
        public string Token { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Password is required.")]
        [StringLength(255, ErrorMessage = "Must be between 5 and 255 characters", MinimumLength = 5)]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Confirm password is required.")]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }
    }
}

