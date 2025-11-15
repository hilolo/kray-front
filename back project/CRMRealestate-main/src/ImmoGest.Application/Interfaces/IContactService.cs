using ImmoGest.Domain.Entities;
using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IContactService : IDataService<Contact>
    {
        /// <summary>
        /// Get a contact by ID with optional related entities
        /// </summary>
        Task<Result<TOut>> GetByIdAsync<TOut>(Guid id, bool includeRelated);

        /// <summary>
        /// Update the archive status of a contact
        /// </summary>
        Task<Result<ContactDto>> UpdateArchiveStatusAsync(UpdateContactArchiveStatusDto dto);
    }
}

