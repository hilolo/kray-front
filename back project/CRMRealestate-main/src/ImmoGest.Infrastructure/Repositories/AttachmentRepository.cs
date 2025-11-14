using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using ResultNet;

namespace ImmoGest.Infrastructure.Repositories
{
    public class AttachmentRepository : Repository<Attachment>, IAttachmentRepository
    {
        public AttachmentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Attachment>> GetByIdAsync(Guid id)
        {
            var attachment = await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            return Result.Success<Attachment>(attachment);
        }
    }
}

