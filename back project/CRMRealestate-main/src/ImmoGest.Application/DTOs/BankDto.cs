using System;

namespace ImmoGest.Application.DTOs
{
    public class BankDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public ContactDto Contact { get; set; }
        public string BankName { get; set; }
        public string RIB { get; set; }
        public string IBAN { get; set; }
        public string Swift { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }

    public class CreateBankDto
    {
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public string BankName { get; set; }
        public string RIB { get; set; }
        public string IBAN { get; set; }
        public string Swift { get; set; }
    }

    public class UpdateBankDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public string BankName { get; set; }
        public string RIB { get; set; }
        public string IBAN { get; set; }
        public string Swift { get; set; }
    }
}

