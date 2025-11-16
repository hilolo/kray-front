using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IBuildingService : IDataService<Building>
    {
        Task<Result<BuildingDto>> UpdateArchiveStatusAsync(UpdateBuildingArchiveStatusDto dto);
    }
}

