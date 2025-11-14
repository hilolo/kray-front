using ImmoGest.Domain.Entities;
using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.DTOs.User;
using ImmoGest.Application.Filters;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IUserService :IDataService<User>
    {
        Task<Result<UserLogin>> Authenticate(string email, string password);
        Task<Result<UserLogin>> AuthenticateWithTokenAsync(Guid id);
        Task<Result> UpdatePassword(Guid id, UpdatePasswordDto dto);
        Task<Result<GetUserDto>> GetCurrentUserAsync(Guid userId);
        Task<Result<GetTeamMemberDto[]>> GetTeamMembersAsync(Guid companyId);
        Task<Result<GetUserDto>> UpdateCurrentUserAsync(Guid userId, UpdateUserDto dto);
        Task<string> TestAvatarUrlGeneration(Guid userId);
    }
}
