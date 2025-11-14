using ImmoGest.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Security.Claims;
using ISession = ImmoGest.Domain.Auth.Interfaces.ISession;

namespace ImmoGest.Application.Auth
{
    public class Session : ISession
    {
        public Guid UserId { get; private set; }
        public Guid CompanyId { get; private set; }
        public DateTime Now => DateTime.Now;

        public Session(IHttpContextAccessor httpContextAccessor)
        {

            var user = httpContextAccessor.HttpContext?.User;

            var nameIdentifier = user?.FindFirst("Id");
            var companyIdClaim = user?.FindFirst("companyId");

            if (nameIdentifier != null)
            {
                UserId = new Guid(nameIdentifier.Value);
            }

            if (companyIdClaim != null)
            {
                CompanyId = new Guid(companyIdClaim.Value);
            }

            // Debug: Log the claims for troubleshooting
            if (user != null)
            {
                // Session initialized
            }
        }
    }
}
