using System;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs.User
{
    public class CreateUserDto
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Password is required.")]
        public string Password { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Name is required.")]
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters.")]
        public string Name { get; set; }

        public bool IsAdmin { get; set; }

        public Guid CompanyId { get; set; }
    }
}
