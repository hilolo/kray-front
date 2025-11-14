using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface IBuildingRepository : IRepository<Building>
    {
        System.Threading.Tasks.Task<IEnumerable<Building>> GetAllWithPropertiesAsync();
        System.Threading.Tasks.Task<Building> GetByIdWithPropertiesAsync(Guid id);
        System.Threading.Tasks.Task UpdateDefaultAttachmentIdAsync(Guid buildingId, Guid? defaultAttachmentId);
        System.Threading.Tasks.Task<int> CountPropertiesAsync(Guid buildingId);
    }
}

