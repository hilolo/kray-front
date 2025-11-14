using ImmoGest.Application.DTOs.Auth;
using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Application.DTOs.User
{
    public class UserLogin
    {
        public GetUserCompanyDto User { get; set; }
        public JwtDto Jwt { get; set; }

    }
}
