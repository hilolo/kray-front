using System;
using System.Threading.Tasks;
using ImmoGest.Domain.Entities;

namespace ImmoGest.Domain.Repositories
{
    public interface IUserPermissionsRepository
    {
        Task<UserPermissions> GetByUserIdAsync(Guid userId);
        Task<UserPermissions> CreateAsync(UserPermissions permissions);
        Task<UserPermissions> UpdateAsync(UserPermissions permissions);
        Task<bool> DeleteAsync(Guid id);
    }
}


