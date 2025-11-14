using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttachmentController : Base
    {
        private readonly IAttachmentService _attachmentService;

        public AttachmentController(IAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        /// <summary>
        /// Get file manager items (folders and files) optionally filtered by root folder path and search term
        /// </summary>
        /// <param name="root">Optional root path (e.g., "contact/AaAafasfAA")</param>
        /// <param name="searchTerm">Optional search term to filter files by name</param>
        /// <returns>File manager response with folders, files, and path</returns>
        [HttpGet]
        [Route("file-manager")]
        [ProducesResponseType(typeof(Result<FileManagerResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<FileManagerResponseDto>>> GetFileManagerItems([FromQuery] string root = null, [FromQuery] string searchTerm = null)
            => ActionResultFor(await _attachmentService.GetFileManagerItemsAsync(root, searchTerm));

        /// <summary>
        /// Upload files to a specific root folder using Base64 encoding (for small files)
        /// </summary>
        /// <param name="request">Upload request containing files and root path</param>
        /// <returns>Upload result</returns>
        [HttpPost]
        [Route("upload")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result>> UploadFiles([FromBody] FileUploadRequestDto request)
            => ActionResultFor(await _attachmentService.UploadFilesAsync(request));

        /// <summary>
        /// Upload large files using multipart form data (recommended for files > 10MB)
        /// </summary>
        /// <param name="files">Files to upload</param>
        /// <param name="root">Root folder path (optional)</param>
        /// <returns>Upload result</returns>
        [HttpPost]
        [Route("upload-multipart")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result>> UploadFilesMultipart(IFormFileCollection files, [FromForm] string root = null)
            => ActionResultFor(await _attachmentService.UploadFilesMultipartAsync(files, root));

        /// <summary>
        /// Get storage usage information
        /// </summary>
        /// <returns>Storage usage information</returns>
        [HttpGet]
        [Route("storage-usage")]
        [ProducesResponseType(typeof(Result<StorageUsageDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<StorageUsageDto>>> GetStorageUsage()
            => ActionResultFor(await _attachmentService.GetStorageUsageAsync());

        /// <summary>
        /// Delete an attachment by ID
        /// </summary>
        /// <param name="id">The attachment's ID</param>
        /// <returns>Delete result</returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result>> DeleteAttachment(Guid id)
            => ActionResultFor(await _attachmentService.DeleteAsync(id));

        /// <summary>
        /// Delete multiple attachments by IDs (files only, not folders)
        /// </summary>
        /// <param name="request">Bulk delete request containing file IDs</param>
        /// <returns>Bulk delete result</returns>
        [HttpPost]
        [Route("bulk-delete")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result>> BulkDeleteAttachments([FromBody] BulkDeleteRequestDto request)
            => ActionResultFor(await _attachmentService.BulkDeleteAsync(request.FileIds));
    }
}

