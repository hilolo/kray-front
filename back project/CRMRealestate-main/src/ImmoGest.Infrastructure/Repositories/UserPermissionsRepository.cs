using System;
using System.Threading.Tasks;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ImmoGest.Infrastructure.Repositories
{
    public class UserPermissionsRepository : IUserPermissionsRepository
    {
        private readonly ApplicationDbContext _context;

        public UserPermissionsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserPermissions> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserPermissions
                .Include(up => up.User)
                .FirstOrDefaultAsync(up => up.UserId == userId);
        }

        public async Task<UserPermissions> CreateAsync(UserPermissions permissions)
        {
            permissions.CreatedOn = DateTimeOffset.UtcNow;
            _context.UserPermissions.Add(permissions);
            await _context.SaveChangesAsync();
            return permissions;
        }

        public async Task<UserPermissions> UpdateAsync(UserPermissions permissions)
        {
            permissions.LastModifiedOn = DateTimeOffset.UtcNow;
            _context.UserPermissions.Update(permissions);
            await _context.SaveChangesAsync();
            return permissions;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var permissions = await _context.UserPermissions.FindAsync(id);
            if (permissions == null) return false;

            _context.UserPermissions.Remove(permissions);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}


