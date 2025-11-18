using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Domain.Entities
{
    /// <summary>
    /// Payment information for a transaction
    /// </summary>
    public class Payment
    {
        public decimal Amount { get; set; }
        public decimal VatPercent { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Transaction entity representing revenue or expense transactions
    /// </summary>
    public class Transaction : Entity, IDeletable
    {
        // Transaction Category (Revenue or Expense)
        public TransactionCategory Category { get; set; }

        // Type-specific enums (one will be null depending on Category)
        public RevenueType? RevenueType { get; set; }
        public ExpenseType? ExpenseType { get; set; }

        // Transaction creation type (Manual from front or Automatic from system)
        public TransactionType TransactionType { get; set; }

        // Transaction status (Pending, Overdue, Paid)
        public TransactionStatus Status { get; set; }

        // Transaction date
        public DateTime Date { get; set; }

        // Payments list (stored as JSON)
        public List<Payment> Payments { get; set; }

        // Total amount (calculated from payments)
        public decimal TotalAmount { get; set; }

        // Description
        public string Description { get; set; }

        // Relationships
        public Property Property { get; set; }
        public Guid? PropertyId { get; set; }

        public Lease Lease { get; set; }
        public Guid? LeaseId { get; set; }

        public Contact Contact { get; set; }
        public Guid? ContactId { get; set; } // From (revenue) or Pay to (expense) - Optional if OtherContactName is provided

        // For contacts not in the system
        public string OtherContactName { get; set; }

        public Company Company { get; set; }
        public Guid CompanyId { get; set; }

        // Attachments
        public ICollection<Attachment> Attachments { get; set; }

        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
        {
            var propertySearch = Property != null
                ? $"{Property.Identifier} {Property.Name} {Property.Address}"
                : "";

            var contactSearch = Contact != null
                ? $"{Contact.FirstName} {Contact.LastName} {Contact.CompanyName} {Contact.Identifier}"
                : (OtherContactName ?? "");

            var leaseSearch = Lease != null && Contact != null
                ? $"{Contact.FirstName} {Contact.LastName} {Contact.CompanyName}"
                : "";

            SearchTerms = $"{Description} {propertySearch} {contactSearch} {leaseSearch}".ToUpper();
        }
    }
}

