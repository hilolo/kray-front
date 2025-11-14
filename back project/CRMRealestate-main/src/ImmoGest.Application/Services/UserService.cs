using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.DTOs.Auth;
using ImmoGest.Application.DTOs.User;
using ImmoGest.Application.Extensions;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain;
using ImmoGest.Domain.Auth;
using ImmoGest.Domain.Auth.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ResultNet;
using BC = BCrypt.Net.BCrypt;


namespace ImmoGest.Application.Services
{
    public class UserService : DataServiceBase<User>, IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly TokenConfiguration _appSettings;
        private readonly ISession _session;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly IUserPermissionsRepository _userPermissionsRepository;

        public UserService(
            IMapper mapper, 
            IUserRepository userRepository, 
            IOptions<TokenConfiguration> appSettings, 
            ISession session,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            IUserPermissionsRepository userPermissionsRepository)
            : base(mapper, userRepository)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _appSettings = appSettings.Value;
            _session = session;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _userPermissionsRepository = userPermissionsRepository;
        }

        public async Task<Result<UserLogin>> Authenticate(string email, string password)
        {
            var userResult = _userRepository.GetUserByEmailAndPassword(email, password);
            return await AuthenticateUserAsync(userResult);
        }

        public async Task<Result<UserLogin>> AuthenticateWithTokenAsync(Guid id)
        {
            var userResult = await _userRepository.GetByIdAsync(id);
            return await AuthenticateUserAsync(userResult);
        }

        public async Task<Result> UpdatePassword(Guid id, UpdatePasswordDto dto)
        {
            var originalUser = _userRepository.GetUserByIdAndPassword(id, dto.currentPassword);
            if (originalUser.IsFailure()) 
            {
                return Result.Failure().WithCode("invalid_password").WithMessage("Current password is incorrect");
            }

            originalUser.Data.Password = BC.HashPassword(dto.newPassword);
            await _userRepository.Update(originalUser.Data);
            await _userRepository.SaveChangesAsync();

            return Result.Success();
        }

        /// <summary>
        /// Get current user with avatar URL
        /// </summary>
        public async Task<Result<GetUserDto>> GetCurrentUserAsync(Guid userId)
        {
            // Get the user entity first
            var userEntityResult = await _userRepository.GetByIdAsync(userId);
            if (userEntityResult.IsFailure())
            {
                return Result.Failure<GetUserDto>().WithCode("user_not_found").WithMessage("User not found");
            }

            // Map to DTO
            var userDto = _mapper.Map<GetUserDto>(userEntityResult.Data);
            
            // Generate avatar URL if avatar exists
            if (!string.IsNullOrEmpty(userEntityResult.Data.Avatar))
            {
                try
                {
                    var avatarUrl = await GenerateAvatarUrlAsync(userEntityResult.Data);
                    userDto.Avatar = avatarUrl;
                }
                catch (Exception ex)
                {
                    userDto.Avatar = string.Empty;
                }
            }
            
            return Result.Success(userDto);
        }

        public async Task<Result<GetTeamMemberDto[]>> GetTeamMembersAsync(Guid companyId)
        {
            // Check if companyId is valid (not empty or default GUID)
            if (companyId == Guid.Empty)
            {
                return Result.Failure<GetTeamMemberDto[]>().WithCode("invalid_company").WithMessage("Invalid company ID");
            }

            var users = await _userRepository.GetUsersByCompanyIdAsync(companyId);
            if (users.IsFailure())
            {
                return Result.Failure<GetTeamMemberDto[]>().WithCode("not_found").WithMessage("No team members found");
            }

            if (users.Data == null || users.Data.Length == 0)
            {
                return Result.Failure<GetTeamMemberDto[]>().WithCode("not_found").WithMessage("No team members found");
            }

            var teamMembers = _mapper.Map<GetTeamMemberDto[]>(users.Data);
            
            // Process avatars for each team member
            for (int i = 0; i < teamMembers.Length; i++)
            {
                var user = users.Data[i];
                if (!string.IsNullOrEmpty(user.Avatar))
                {
                    try
                    {
                        // Use the same avatar URL generation method
                        var avatarUrl = await GenerateAvatarUrlAsync(user);
                        teamMembers[i].Avatar = avatarUrl;
                    }
                    catch (Exception ex)
                    {
                        // If avatar URL generation fails, set to empty string
                        teamMembers[i].Avatar = string.Empty;
                    }
                }
            }

            return Result.Success(teamMembers);
        }

        public async Task<Result<GetUserDto>> UpdateCurrentUserAsync(Guid userId, UpdateUserDto dto)
        {
            // Get the current user
            var userResult = await _userRepository.GetByIdAsync(userId);
            if (userResult.IsFailure())
            {
                return Result.Failure<GetUserDto>().WithCode("user_not_found").WithMessage("User not found");
            }

            var user = userResult.Data;

            // Update basic fields
            if (!string.IsNullOrEmpty(dto.Name))
                user.Name = dto.Name;
            
            if (!string.IsNullOrEmpty(dto.Phone))
                user.Phone = dto.Phone;

            // Handle avatar update if provided
            if (!string.IsNullOrEmpty(dto.Avatar))
            {
                try
                {
                    // Validate base64 data
                    if (!IsValidBase64String(dto.Avatar))
                    {
                        return Result.Failure<GetUserDto>().WithCode("invalid_base64").WithMessage("Invalid base64 data provided for avatar");
                    }

                    // Delete old avatar if it exists
                    if (!string.IsNullOrEmpty(user.Avatar))
                    {
                        try
                        {
                            var bucketName = GetBucketName();
                            var oldAvatarKey = $"companies/{user.CompanyId}/{user.Id}/avatar/{user.Avatar}";
                            
                            await _s3StorageService.DeleteAsync(bucketName, oldAvatarKey);
                        }
                        catch (Exception deleteEx)
                        {
                            // Continue with upload even if deletion fails
                        }
                    }

                    // Get file extension from base64 data
                    var fileExtension = GetImageExtensionFromBase64(dto.Avatar);
                    
                    // Upload to S3 using the company-specific method which generates unique filenames
                    // bucketName is already declared above
                    
                    try
                    {
                        // Use UploadBase64ForCompanyAsync which generates unique 26-character filenames
                        var uploadResult = await _s3StorageService.UploadBase64ForCompanyAsync(
                            user.CompanyId.ToString(), 
                            $"avatar{fileExtension}", 
                            dto.Avatar, 
                            "image/jpeg", 
                            $"{user.Id}/avatar"
                        );
                        
                        // Extract the filename from the returned URL
                        var fileName = ExtractFileNameFromUrl(uploadResult);
                        user.Avatar = fileName;
                    }
                    catch (Exception uploadEx)
                    {
                        return Result.Failure<GetUserDto>().WithCode("avatar_upload_failed").WithMessage($"Failed to upload avatar image: {uploadEx.Message}");
                    }
                }
                catch (Exception ex)
                {
                    return Result.Failure<GetUserDto>().WithCode("avatar_processing_failed").WithMessage($"Failed to process avatar image: {ex.Message}");
                }
            }

            // Update the user in database
            await _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            // Return the updated user data with avatar URL
            var updatedUserResult = await GetCurrentUserAsync(userId);
            
            return updatedUserResult;
        }

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        /// <summary>
        /// Test avatar URL generation for debugging
        /// </summary>
        public async Task<string> TestAvatarUrlGeneration(Guid userId)
        {
            try
            {
                var userEntityResult = await _userRepository.GetByIdAsync(userId);
                if (userEntityResult.IsFailure())
                {
                    return "User not found";
                }

                var user = userEntityResult.Data;
                if (string.IsNullOrEmpty(user.Avatar))
                {
                    return "User has no avatar";
                }

                var avatarUrl = await GenerateAvatarUrlAsync(user);
                return avatarUrl;
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        private bool IsValidBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return false;

            try
            {
                Convert.FromBase64String(base64String);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private string GetImageExtensionFromBase64(string base64String)
        {
            // Check for common image format headers in base64
            if (base64String.StartsWith("/9j/"))
                return ".jpg";
            if (base64String.StartsWith("iVBORw0KGgo"))
                return ".png";
            if (base64String.StartsWith("R0lGOD"))
                return ".gif";
            if (base64String.StartsWith("UklGR"))
                return ".webp";
            
            // Default to .jpg if format cannot be determined
            return ".jpg";
        }

        private string ExtractFileNameFromUrl(string url)
        {
            try
            {
                // Extract filename from URL - this assumes the URL contains the filename
                // The URL structure should be something like: https://...bucket.../companies/companyId/userId/avatar/filename
                var uri = new Uri(url);
                var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                
                // The filename is always the last segment in the path
                // Path structure: companies/{companyId}/{userId}/avatar/{filename}
                if (pathSegments.Length > 0)
                {
                    var lastSegment = pathSegments[pathSegments.Length - 1];
                    return lastSegment;
                }
                
                // Fallback: generate a unique filename
                return GenerateUniqueFileName();
            }
            catch (Exception ex)
            {
                // If URL parsing fails, generate a unique filename
                return GenerateUniqueFileName();
            }
        }

        private string GenerateUniqueFileName()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 26)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        /// <summary>
        /// Generate avatar URL for a user using only the image name from database
        /// </summary>
        private async Task<string> GenerateAvatarUrlAsync(User user)
        {
            if (string.IsNullOrEmpty(user.Avatar))
                return string.Empty;

            try
            {
                var bucketName = GetBucketName();
                
                // Construct the key using the company ID, user ID, and avatar filename
                // The avatar field in database contains only the filename (e.g., "F5mVBOwAtaUbBK4dUbpQ6DETu1.png")
                // The path should match the upload path: companies/{companyId}/{userId}/avatar/{fileName}
                // Note: User avatars use a different path structure than other entities
                var key = $"companies/{user.CompanyId}/{user.Id}/avatar/{user.Avatar}";
                
                // Generate signed URL with CORS support for localhost
                // For user avatars, we don't have an attachment entity, so pass null for cached URL
                var avatarUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(bucketName, key, null, null, 24);
                return avatarUrl;
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        protected override Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            filterOption.CompanyId = _session.CompanyId;
            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        protected override async Task InGet_AfterMappingAsync<TOut>(User entity, TOut mappedEntity)
        {
            if (!string.IsNullOrEmpty(entity.Avatar))
            {
                try
                {
                    // Use the centralized avatar URL generation method
                    var avatarUrl = await GenerateAvatarUrlAsync(entity);
                    
                    if (mappedEntity is GetUserDto userDto)
                    {
                        userDto.Avatar = avatarUrl;
                    }
                    else if (mappedEntity is GetUserCompanyDto userCompanyDto)
                    {
                        userCompanyDto.Avatar = avatarUrl;
                    }
                }
                catch (Exception ex)
                {
                    // If avatar URL generation fails, set to empty string
                    if (mappedEntity is GetUserDto userDto)
                    {
                        userDto.Avatar = string.Empty;
                    }
                    else if (mappedEntity is GetUserCompanyDto userCompanyDto)
                    {
                        userCompanyDto.Avatar = string.Empty;
                    }
                }
            }

            await base.InGet_AfterMappingAsync(entity, mappedEntity);
        }

        #region common
        public async Task<JwtDto> GenerateTokenAsync(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            var expDate = DateTime.UtcNow.AddHours(1);

            // Get user permissions
            var userPermissions = await _userPermissionsRepository.GetByUserIdAsync(user.Id);
            string permissionsJson = "{}";
            
            if (userPermissions != null)
            {
                permissionsJson = userPermissions.PermissionsJson;
            }

            var claims = new ClaimsIdentity(new Claim[]
                {
            new Claim("Id", user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Name, user.Name ?? ""),
            new Claim("companyId", user.CompanyId.ToString()),
            new Claim("company", user.Company.ToString()),
            new Claim("expires", expDate.ToString()),
            new Claim("plan","basic"),
            new Claim("permissions", permissionsJson)
                });

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = claims,
                Expires = expDate,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Audience = _appSettings.Audience,
                Issuer = _appSettings.Issuer
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new JwtDto
            {
                Token = tokenHandler.WriteToken(token),
                ExpDate = expDate
            };
        }
        
        // Keep the old synchronous method for backward compatibility (deprecated)
        public JwtDto GenerateToken(User user)
        {
            return GenerateTokenAsync(user).GetAwaiter().GetResult();
        }

        private async Task<Result<UserLogin>> AuthenticateUserAsync(Result<User> userResult)
        {
            if (userResult.IsSuccess())
            {
                var user = userResult.Data;
                var mappedUserLogin = _mapper.Map<UserLogin>(user);
                
                // Generate avatar URL if avatar exists
                if (!string.IsNullOrEmpty(user.Avatar))
                {
                    try
                    {
                        var avatarUrl = await GenerateAvatarUrlAsync(user);
                        mappedUserLogin.User.Avatar = avatarUrl;
                    }
                    catch (Exception ex)
                    {
                        mappedUserLogin.User.Avatar = string.Empty;
                    }
                }
                
                // Generate token with permissions included
                mappedUserLogin.Jwt = await GenerateTokenAsync(user);
                return Result.Success(mappedUserLogin).WithCode(MessageCode.Connected);
            }

            // Check if the failure is due to company restriction
            if (userResult.Code == "company_restricted")
            {
                return Result.Failure<UserLogin>().WithCode("company_restricted").WithMessage("Your company account has been restricted. Please contact an administrator.");
            }

            return Result.Failure<UserLogin>().WithCode(MessageCode.UserNotFound);
        }

        #endregion
    }
}
