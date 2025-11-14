using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IUserPermissionsService
    {
        Task<Result<UserPermissionsDto>> GetUserPermissionsAsync(Guid userId);
        Task<Result<UserPermissionsDto>> UpdateUserPermissionsAsync(Guid userId, UpdateUserPermissionsDto dto);
        Task<Result<UserPermissionsDto>> CreateDefaultPermissionsAsync(Guid userId);
    }
}

