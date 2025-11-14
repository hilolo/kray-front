using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPermissionsController : Base
    {
        private readonly IUserPermissionsService _permissionsService;

        public UserPermissionsController(IUserPermissionsService permissionsService)
        {
            _permissionsService = permissionsService;
        }

        /// <summary>
        /// Get user permissions by user ID
        /// </summary>
        /// <param name="userId">The user's ID</param>
        /// <returns>User permissions</returns>
        [HttpGet]
        [Route("{userId}")]
        [ProducesResponseType(typeof(UserPermissionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<UserPermissionsDto>>> GetUserPermissions(Guid userId)
            => ActionResultFor(await _permissionsService.GetUserPermissionsAsync(userId));

        /// <summary>
        /// Update user permissions (Admin only)
        /// </summary>
        /// <param name="userId">The user's ID</param>
        /// <param name="dto">Updated permissions data</param>
        /// <returns>Updated user permissions</returns>
        [HttpPut]
        [Route("{userId}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UserPermissionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<UserPermissionsDto>>> UpdateUserPermissions(Guid userId, [FromBody] UpdateUserPermissionsDto dto)
            => ActionResultFor(await _permissionsService.UpdateUserPermissionsAsync(userId, dto));

        /// <summary>
        /// Create default permissions for a user
        /// </summary>
        /// <param name="userId">The user's ID</param>
        /// <returns>Created default permissions</returns>
        [HttpPost]
        [Route("{userId}/default")]
        [ProducesResponseType(typeof(UserPermissionsDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<UserPermissionsDto>>> CreateDefaultPermissions(Guid userId)
            => ActionResultFor(await _permissionsService.CreateDefaultPermissionsAsync(userId));
    }
}

