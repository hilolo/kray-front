using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;

namespace ImmoGest.Application.Services
{
    public class BankService : DataServiceBase<Bank>, IBankService
    {
        private readonly IBankRepository _bankRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;

        public BankService(
            IMapper mapper,
            IBankRepository bankRepository,
            ISession session)
            : base(mapper, bankRepository)
        {
            _mapper = mapper;
            _bankRepository = bankRepository;
            _session = session;
        }

        protected override Task InCreate_BeforInsertAsync<TCreateModel>(Bank entity, TCreateModel createModel)
        {
            // Set CompanyId from session (security: prevent users from setting different company)
            entity.CompanyId = _session.CompanyId;
            entity.BuildSearchTerms();
            return base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override Task InUpdate_BeforUpdateAsync<TUpdateModel>(Bank entity, TUpdateModel updateModel)
        {
            // Set CompanyId from session (security: prevent users from changing company)
            entity.CompanyId = _session.CompanyId;
            
            // Map the update model to the entity
            if (updateModel is UpdateBankDto updateDto)
            {
                entity.ContactId = updateDto.ContactId;
                entity.BankName = updateDto.BankName;
                entity.RIB = updateDto.RIB;
                entity.IBAN = updateDto.IBAN;
                entity.Swift = updateDto.Swift;
            }
            
            entity.BuildSearchTerms();
            return base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }
    }
}

