using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Application.DTOs.User
{
    public class GetUserDto
    {
        public Guid Id { get; set; }
        public string Avatar { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
    }
}
