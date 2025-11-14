using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs.User
{
    public class UpdatePasswordDto
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Password is required.")]
        [StringLength(255, ErrorMessage = "Must be between 5 and 255 characters", MinimumLength = 5)]
        [DataType(DataType.Password)]
        public string newPassword { get; set; }
        public string confirmPassword { get; set; }
        public string currentPassword { get; set; }
    }
}
