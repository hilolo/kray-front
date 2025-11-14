using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;
using System.Collections.Generic;

namespace ImmoGest.Domain.Repositories
{
    public interface IContactRepository : IRepository<Contact>
    {
        void DeleteContactAttachments(List<Attachment> attachments);
    }
} 