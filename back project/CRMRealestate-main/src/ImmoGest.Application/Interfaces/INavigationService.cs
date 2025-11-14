using ImmoGest.Application.DTOs.Navigation;
using ResultNet;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces
{
    public interface INavigationService
    {
        Task<Result<NavigationResponseDto>> GetNavigationAsync();
    }
}
