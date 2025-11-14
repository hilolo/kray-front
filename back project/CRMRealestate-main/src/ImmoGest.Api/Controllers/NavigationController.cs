using ImmoGest.Application.DTOs.Navigation;
using ImmoGest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;
using System.Threading.Tasks;

namespace ImmoGest.Api.Controllers
{
    [Route("api/common")]
    [AllowAnonymous]
    public class NavigationController : Base
    {
        private readonly INavigationService _navigationService;

        public NavigationController(INavigationService navigationService)
        {
            _navigationService = navigationService;
        }

        /// <summary>
        /// Get navigation data for the frontend
        /// </summary>
        /// <returns>Navigation data</returns>
        [HttpGet]
        [Route("navigation")]
        [ProducesResponseType(typeof(NavigationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<NavigationResponseDto>>> GetNavigation()
        {
            var result = await _navigationService.GetNavigationAsync();
            return ActionResultFor(result);
        }
    }
}
