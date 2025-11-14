using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class UserPermissionsService : IUserPermissionsService
    {
        private readonly IUserPermissionsRepository _permissionsRepository;

        public UserPermissionsService(IUserPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        public async Task<Result<UserPermissionsDto>> GetUserPermissionsAsync(Guid userId)
        {
            try
            {
                var permissions = await _permissionsRepository.GetByUserIdAsync(userId);
                
                if (permissions == null)
                {
                    // Create default permissions if none exist
                    return await CreateDefaultPermissionsAsync(userId);
                }

                var permissionsDict = JsonSerializer.Deserialize<Dictionary<string, ModulePermissionDto>>(
                    permissions.PermissionsJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                var dto = new UserPermissionsDto
                {
                    Id = permissions.Id,
                    UserId = permissions.UserId,
                    Permissions = permissionsDict
                };

                return Result.Success(dto);
            }
            catch (Exception ex)
            {
                return Result.Failure<UserPermissionsDto>().WithMessage(ex.Message);
            }
        }

        public async Task<Result<UserPermissionsDto>> UpdateUserPermissionsAsync(Guid userId, UpdateUserPermissionsDto dto)
        {
            try
            {
                var permissions = await _permissionsRepository.GetByUserIdAsync(userId);
                
                if (permissions == null)
                {
                    return Result.Failure<UserPermissionsDto>()
                        .WithCode("not_found")
                        .WithMessage("User permissions not found");
                }

                permissions.PermissionsJson = JsonSerializer.Serialize(dto.Permissions);
                await _permissionsRepository.UpdateAsync(permissions);

                var resultDto = new UserPermissionsDto
                {
                    Id = permissions.Id,
                    UserId = permissions.UserId,
                    Permissions = dto.Permissions
                };

                return Result.Success(resultDto);
            }
            catch (Exception ex)
            {
                return Result.Failure<UserPermissionsDto>().WithMessage(ex.Message);
            }
        }

        public async Task<Result<UserPermissionsDto>> CreateDefaultPermissionsAsync(Guid userId)
        {
            try
            {
                // Default permissions: view-only for most modules
                var defaultPermissions = new Dictionary<string, ModulePermissionDto>
                {
                    ["dashboard"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["properties"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["buildings"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["leasing"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["reservations"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["maintenance"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["contacts"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["keys"] = new ModulePermissionDto { View = false, Edit = false, Delete = false },
                    ["banks"] = new ModulePermissionDto { View = false, Edit = false, Delete = false },
                    ["payments"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["file-manager"] = new ModulePermissionDto { View = true, Edit = false, Delete = false },
                    ["reports"] = new ModulePermissionDto { View = false, Edit = false, Delete = false },
                    ["settings"] = new ModulePermissionDto { View = false, Edit = false, Delete = false }
                };

                var permissions = new UserPermissions
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    PermissionsJson = JsonSerializer.Serialize(defaultPermissions),
                    CreatedOn = DateTimeOffset.UtcNow
                };

                await _permissionsRepository.CreateAsync(permissions);

                var dto = new UserPermissionsDto
                {
                    Id = permissions.Id,
                    UserId = userId,
                    Permissions = defaultPermissions
                };

                return Result.Success(dto);
            }
            catch (Exception ex)
            {
                return Result.Failure<UserPermissionsDto>().WithMessage(ex.Message);
            }
        }
    }
}

