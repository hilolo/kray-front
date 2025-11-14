using System;
using System.Threading.Tasks;
using Humanizer;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.DTOs.Auth;
using ImmoGest.Application.DTOs.User;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;
using ISession = ImmoGest.Domain.Auth.Interfaces.ISession;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : Base
    {
        private readonly IUserService _userService;
        private readonly ISession _session;

        public UserController(IUserService userService, ISession session)
        {
            _userService = userService;
            _session = session;
        }

        /// <summary>
        /// Authenticates the user and returns the token information.
        /// </summary>
        /// <param name="loginInfo">Email and password information</param>
        /// <returns>Token information</returns>
        [HttpPost]
        [Route("sign-in")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(JwtDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<UserLogin>>> Authenticate([FromBody] LoginDto loginInfo)
        => ActionResultFor(await _userService.Authenticate(loginInfo.Email, loginInfo.Password));

        /// <summary>
        /// Replace the access token with the new one if it's available on
        /// the response object.
        /// This is an added optional step for better security. Once you sign
        /// in using the token, you should generate a new one on the server
        /// side and attach it to the response object. Then the following
        /// piece of code can replace the token with the refreshed one.
        /// </summary>
        /// <param name="loginInfo">Email and password information</param>
        /// <returns>Token information</returns>
        [HttpPost]
        [Route("sign-in-with-token")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(JwtDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<UserLogin>>> AuthenticateWithToken()
        => ActionResultFor(await _userService.AuthenticateWithTokenAsync(_session.UserId));

        /// <summary>
        /// Get one user by id from the database
        /// </summary>
        /// <param name="id">The user's ID</param>
        /// <returns></returns>
        [Authorize(Roles = Roles.Admin)]
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GetUserCompanyDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<GetUserCompanyDto>>> GetUserById(Guid id)
         => ActionResultFor(await _userService.GetByIdAsync<GetUserCompanyDto>(id));

        [HttpPatch("updatePassword")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result>> UpdatePassword([FromBody] UpdatePasswordDto dto)
        => ActionResultFor(await _userService.UpdatePassword(_session.UserId, dto));

        /// <summary>
        /// Update the current authenticated user's profile
        /// </summary>
        /// <param name="dto">User update data including name, phone, and avatar</param>
        /// <returns>Updated user information</returns>
        [HttpPut]
        [Route("me")]
        [ProducesResponseType(typeof(GetUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<GetUserDto>>> UpdateCurrentUser([FromBody] UpdateUserDto dto)
            => ActionResultFor(await _userService.UpdateCurrentUserAsync(_session.UserId, dto));

        [ProducesResponseType(typeof(GetUserCompanyDto), StatusCodes.Status200OK)]
        [HttpPut("{id}")]
        public async Task<ActionResult<Result<GetUserCompanyDto>>> Update(Guid id, [FromBody] UpdateUserDto dto)
           => ActionResultFor(await _userService.UpdateAsync<GetUserCompanyDto, UpdateUserDto>(id, dto));

        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult<Result>> DeleteUser(Guid id)
        => ActionResultFor(await _userService.DeleteAsync(id));

        /// <summary>
        /// Returns all users in the database
        /// </summary>
        /// <param name="filter"></param>
        /// <returns></returns>
        [ProducesResponseType(typeof(PaginatedList<GetUserCompanyDto>), StatusCodes.Status200OK)]
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<Result<PaginatedList<GetUserCompanyDto>>>> GetUsers([FromBody] GetUsersFilter filter)
        => ActionResultFor(await _userService.GetAsPagedResultAsync<GetUserCompanyDto, GetUsersFilter>(filter));

        /// <summary>
        /// Get the current authenticated user's information
        /// </summary>
        /// <returns>Current user information</returns>
        /// 
        [ProducesResponseType(typeof(PaginatedList<GetUserDto>), StatusCodes.Status200OK)]
        [HttpGet]
        [Route("me")]
        public async Task<ActionResult<Result<GetUserDto>>> GetCurrentUser()
            => ActionResultFor(await _userService.GetCurrentUserAsync(_session.UserId));

        /// <summary>
        /// Get all team members in the current user's organization
        /// </summary>
        /// <returns>List of team members with avatar, name, and role</returns>
        [HttpGet]
        [Route("team")]
        [ProducesResponseType(typeof(GetTeamMemberDto[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<GetTeamMemberDto[]>>> GetTeamMembers()
            => ActionResultFor(await _userService.GetTeamMembersAsync(_session.CompanyId));

        /// <summary>
        /// Test avatar URL generation for debugging
        /// </summary>
        /// <returns>Generated avatar URL or error message</returns>
        [HttpGet]
        [Route("test-avatar")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<ActionResult<string>> TestAvatarUrl()
        {
            var result = await _userService.TestAvatarUrlGeneration(_session.UserId);
            return Ok(result);
        }

    }
}
