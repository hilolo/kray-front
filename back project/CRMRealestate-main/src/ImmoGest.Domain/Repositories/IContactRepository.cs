using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface IContactRepository : IRepository<Contact>
    {
        void DeleteContactAttachments(List<Attachment> attachments);
        Task<Result<Contact>> GetByIdWithRelatedAsync(Guid id, bool includeRelated);
    }
} 