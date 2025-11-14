using System;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs.User
{
    public class UpdateUserDto
    {
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters.")]
        public string Name { get; set; }

        public string Phone { get; set; }

        [StringLength(10485760, ErrorMessage = "Avatar data cannot exceed 10MB.")] // 10MB base64 limit
        public string Avatar { get; set; } // This will contain base64 image data
    }
}
