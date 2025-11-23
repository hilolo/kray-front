using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IDocumentService : IDataService<Document>
    {
        /// <summary>
        /// Get PDFMake data with placeholders replaced using example data
        /// </summary>
        /// <param name="id">Document ID</param>
        /// <param name="exampleData">Optional example data. If not provided, uses document's Example property</param>
        /// <returns>Processed PDFMake JSON object</returns>
        Task<Result<object>> GetProcessedPdfMakeAsync(Guid id, Dictionary<string, string> exampleData = null);
    }
}

