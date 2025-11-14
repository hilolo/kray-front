using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    /// <summary>
    /// DTO for bulk delete request
    /// </summary>
    public class BulkDeleteRequestDto
    {
        /// <summary>
        /// List of file IDs to delete
        /// </summary>
        public List<Guid> FileIds { get; set; } = new List<Guid>();
    }
}
