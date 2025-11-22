using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : Base
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        /// <summary>
        /// Creates a new document
        /// </summary>
        /// <param name="dto">Document creation data</param>
        /// <returns>Created document</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<DocumentDto>>> CreateDocument([FromBody] CreateDocumentDto dto)
            => ActionResultFor(await _documentService.CreateAsync<DocumentDto, CreateDocumentDto>(dto));

        /// <summary>
        /// Get a document by ID
        /// </summary>
        /// <param name="id">The document's ID</param>
        /// <returns>Document details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<DocumentDto>>> GetDocumentById(Guid id)
            => ActionResultFor(await _documentService.GetByIdAsync<DocumentDto>(id));

        /// <summary>
        /// Update an existing document
        /// </summary>
        /// <param name="id">The document's ID</param>
        /// <param name="dto">Document update data</param>
        /// <returns>Updated document</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<DocumentDto>>> UpdateDocument(Guid id, [FromBody] UpdateDocumentDto dto)
        {
            dto.Id = id;
            return ActionResultFor(await _documentService.UpdateAsync<DocumentDto, UpdateDocumentDto>(id, dto));
        }

        /// <summary>
        /// Delete a document (soft delete)
        /// </summary>
        /// <param name="id">The document's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteDocument(Guid id)
            => ActionResultFor(await _documentService.DeleteAsync(id));

        /// <summary>
        /// Get all documents with pagination and filtering
        /// To get all documents without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of documents</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<DocumentDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<DocumentDto>>>> GetDocuments([FromBody] GetDocumentsFilter filter)
            => ActionResultFor(await _documentService.GetAsPagedResultAsync<DocumentDto, GetDocumentsFilter>(filter));
    }
}

