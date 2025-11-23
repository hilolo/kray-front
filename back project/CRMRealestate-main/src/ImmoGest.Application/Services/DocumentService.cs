using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class DocumentService : DataServiceBase<Document>, IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;

        public DocumentService(
            IMapper mapper,
            IDocumentRepository documentRepository,
            ISession session)
            : base(mapper, documentRepository)
        {
            _documentRepository = documentRepository;
            _mapper = mapper;
            _session = session;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Document entity, TCreateModel createModel)
        {
            if (createModel is CreateDocumentDto dto)
            {
                // Generate a new Guid for the entity if it's empty
                if (entity.Id == Guid.Empty)
                {
                    entity.Id = Guid.NewGuid();
                }

                // Set CompanyId from session if not provided
                if (dto.CompanyId == Guid.Empty)
                {
                    entity.CompanyId = _session.CompanyId;
                }
                else
                {
                    entity.CompanyId = dto.CompanyId;
                }
            }
            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Document entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateDocumentDto dto)
            {
                // Map all fields from DTO to entity
                _mapper.Map(dto, entity);

                // Update CompanyId from session if not provided in DTO
                if (!dto.CompanyId.HasValue)
                {
                    entity.CompanyId = _session.CompanyId;
                }
                else if (dto.CompanyId.Value != Guid.Empty)
                {
                    entity.CompanyId = dto.CompanyId.Value;
                }
            }
            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        protected override Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            // For template tab (IsLocked: true), return all templates without companyId filter
            // For other queries, apply companyId filter as usual
            if (filterOption is GetDocumentsFilter filter && filter.IsLocked.HasValue && filter.IsLocked.Value == true)
            {
                // Don't set CompanyId - return all templates regardless of company
                filterOption.CompanyId = null;
            }
            else
            {
                // Set CompanyId from session for regular queries (documents)
                filterOption.CompanyId = _session.CompanyId;
            }
            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        public async Task<Result<object>> GetProcessedPdfMakeAsync(Guid id, Dictionary<string, string> exampleData = null)
        {
            try
            {
                // Get the document
                var documentResult = await _documentRepository.GetByIdAsync(id);
                if (documentResult == null || documentResult.Data == null)
                {
                    return Result.Failure<object>().WithCode(MessageCode.NotFound);
                }

                var document = documentResult.Data;

                // Use provided example data or document's example data
                var dataToUse = exampleData ?? document.Example ?? new Dictionary<string, string>();

                // Check if Pdfmake exists
                if (string.IsNullOrWhiteSpace(document.Pdfmake))
                {
                    return Result.Failure<object>().WithMessage("Document does not have PDFMake data");
                }

                // Treat content as text and replace placeholders
                var processedText = ReplacePlaceholdersInText(document.Pdfmake, dataToUse);
                return Result.Success(processedText);
            }
            catch (Exception ex)
            {
                return Result.Failure<object>().WithMessage($"Error processing PDFMake data: {ex.Message}");
            }
        }

        /// <summary>
        /// Replaces placeholders in text format #PropertyName# with values from the dictionary
        /// </summary>
        private string ReplacePlaceholdersInText(string text, Dictionary<string, string> replacementData)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            var result = text;
            foreach (var kvp in replacementData)
            {
                var placeholder = $"#{kvp.Key}#";
                if (result.Contains(placeholder))
                {
                    result = result.Replace(placeholder, kvp.Value ?? string.Empty);
                }
            }
            return result;
        }

    }
}

