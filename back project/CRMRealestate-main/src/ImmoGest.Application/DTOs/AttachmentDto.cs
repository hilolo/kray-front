using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class AttachmentDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string OriginalFileName { get; set; }
        public string FileExtension { get; set; }
        public long FileSize { get; set; }  // Size in bytes
        public string Root { get; set; }  // Generic root identifier
        public string StorageHash { get; set; }  // Immutable hash used for S3 storage keys (never changes)
        public Guid? ContactId { get; set; }  // Optional contact reference
        public string Url { get; set; }  // Generated signed URL for download
        public DateTime CreatedAt { get; set; }
    }

    public class AttachmentInputDto
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }  // Base64 encoded file
        public string Root { get; set; }  // Generic root identifier
        public Guid? ContactId { get; set; }  // Optional contact reference
    }

    // File Manager DTOs
    public class FileManagerItemDto
    {
        public string Id { get; set; }
        public string FolderId { get; set; }
        public string Name { get; set; }
        public string CreatedAt { get; set; }
        public string ModifiedAt { get; set; }
        public string Size { get; set; }
        public string Type { get; set; }
        public string Contents { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
    }

    public class FileManagerResponseDto
    {
        public List<FileManagerItemDto> Folders { get; set; }
        public List<FileManagerItemDto> Files { get; set; }
        public List<FileManagerItemDto> Path { get; set; }
    }

    public class FileUploadRequestDto
    {
        public List<FileUploadItemDto> Files { get; set; }
        public string Root { get; set; }
    }

    public class FileUploadItemDto
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }
    }
}

