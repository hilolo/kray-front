using ImmoGest.Domain.Entities;
using System;

namespace ImmoGest.Application.DTOs.User
{
    public class GetUserCompanyDto
    {
        public Guid Id { get; set; }
        public string Avatar { get; set; }
        public string Email { get; set; }
        public bool IsAdmin { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public Guid CompanyId { get; set; }
        public Company Company { get; set; }
    }
}
