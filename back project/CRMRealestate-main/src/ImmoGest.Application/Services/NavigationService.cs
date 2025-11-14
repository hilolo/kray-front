using AutoMapper;
using ImmoGest.Application.DTOs.Navigation;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Repositories;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Application.Services
{
    public class NavigationService : INavigationService
    {
        private readonly INavigationRepository _navigationRepository;
        private readonly IMapper _mapper;

        public NavigationService(INavigationRepository navigationRepository, IMapper mapper)
        {
            _navigationRepository = navigationRepository;
            _mapper = mapper;
        }

        public async Task<Result<NavigationResponseDto>> GetNavigationAsync()
        {
            try
            {
                // Get navigation items
                var result = await _navigationRepository.GetHierarchicalAsync();
                if (result.IsSuccess())
                {
                    var items = _mapper.Map<List<NavigationDto>>(result.Data);
                    
                    var response = new NavigationResponseDto();
                    response.AddRange(items);
                    return Result.Success(response);
                }

                return Result.Success(new NavigationResponseDto());
            }
            catch (Exception ex)
            {
                return Result.Failure<NavigationResponseDto>();
            }
        }
    }
}
