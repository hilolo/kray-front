using System;
using System.Threading.Tasks;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;

namespace ImmoGest.Domain.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Result<User> GetUserByEmailAndPassword(string email, string password);
        Result<User> GetUserByIdAndPassword(Guid Id, string password);
        Task<Result<User[]>> GetUsersByCompanyIdAsync(Guid companyId);
    }
}
