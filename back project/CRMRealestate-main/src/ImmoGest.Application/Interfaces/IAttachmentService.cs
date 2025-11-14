using ImmoGest.Application.DTOs;
using ImmoGest.Domain.Entities;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ImmoGest.Application.Interfaces
{
    public interface IAttachmentService : IDataService<Attachment>
    {
        Task<Result<FileManagerResponseDto>> GetFileManagerItemsAsync(string root = null, string searchTerm = null);
        Task<Result> UploadFilesAsync(FileUploadRequestDto request);
        Task<Result> UploadFilesMultipartAsync(IFormFileCollection files, string root = null);
        Task<Result<StorageUsageDto>> GetStorageUsageAsync();
        Task<Result> BulkDeleteAsync(List<Guid> fileIds);
        Task<List<Attachment>> GetAllAttachmentsForPropertyAsync(Guid propertyId);
    }
}

