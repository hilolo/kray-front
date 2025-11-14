using System;

namespace ImmoGest.Application.DTOs.User
{
    public class GetTeamMemberDto
    {
        public Guid Id { get; set; }
        public string Avatar { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}
