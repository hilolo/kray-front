using ImmoGest.Application.DTOs.User;
using ImmoGest.Application.Filters;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BC = BCrypt.Net.BCrypt;

namespace ImmoGest.Infrastructure.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext dbContext) : base(dbContext)
        {

        }

        public virtual Result<User> GetUserByEmailAndPassword(string email, string password)
        {
            var user = DbSet.AsNoTracking()
                    .Include(x => x.Company)
                    .FirstOrDefault(x => x.Email.ToLower() == email.ToLower());

            if (user != null && BC.Verify(password, user.Password))
            {
                // Check if company is restricted
                if (user.Company != null && user.Company.Restricted)
                {
                    return Result.Failure<User>().WithCode("company_restricted");
                }

                var expDate = DateTime.UtcNow.AddDays(7);
                var claims = new ClaimsIdentity(new Claim[]
                {
                    new Claim("Id", user.Id.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(ClaimTypes.Sid, user.CompanyId.ToString()),
                    new Claim("expires", expDate.ToString()),
                    new Claim("plan","basic")
                });
                return Result.Success(user);
            }

            return Result.Failure<User>();
        }

        public virtual Result<User> GetUserByIdAndPassword(Guid Id, string currentPassword)
        {
            var user = DbSet.AsNoTracking().FirstOrDefault(x =>
                x.Id == Id);

            if (user != null && BC.Verify(currentPassword, user.Password))
            {
                return Result.Success(user);
            }

            return Result.Failure<User>();
        }

        public virtual async Task<Result<User[]>> GetUsersByCompanyIdAsync(Guid companyId)
        {
            // Note: Deleted users are automatically filtered by global query filter
            var users = await DbSet
                .AsNoTracking()
                .Include(x => x.Company)
                .Where(x => x.CompanyId == companyId)
                .ToArrayAsync();

            return Result.Success(users);
        }


        public override async Task<Result<User>> GetByIdAsync(Guid id)
        {
            var user = await DbSet
                .AsNoTracking()
                .Include(x => x.Company)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (user != null)
            {
                // Check if company is restricted
                if (user.Company != null && user.Company.Restricted)
                {
                    return Result.Failure<User>().WithCode("company_restricted");
                }
                
                return Result.Success(user);
            }

            return Result.Failure<User>();
        }

        protected override IQueryable<User> SetPagedResultFilterOptions<IFilter>(IQueryable<User> query, IFilter filterOption)
        {
            if (filterOption is GetUsersFilter filter)
            {
                query = query.Where(e => e.CompanyId == filter.CompanyId);
            }
            return base.SetPagedResultFilterOptions(query, filterOption);
        }

    }
}
