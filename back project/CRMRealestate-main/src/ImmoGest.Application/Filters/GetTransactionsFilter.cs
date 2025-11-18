using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.Filters
{
    public class GetTransactionsFilter : FilterOption
    {
        public Guid? CompanyId { get; set; }
        public TransactionCategory? Category { get; set; }
        public TransactionCategory? Type { get; set; } // Alias for Category to match frontend (maps to Category)
        public TransactionStatus? Status { get; set; }
        public TransactionType? TransactionType { get; set; }
        public List<RevenueType>? RevenueTypes { get; set; } // Filter by multiple revenue types
        public List<ExpenseType>? ExpenseTypes { get; set; } // Filter by multiple expense types
        public Guid? PropertyId { get; set; }
        public Guid? ContactId { get; set; }
        public Guid? LeaseId { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string SearchTerm { get; set; }
        public string SearchQuery { get; set; } // Alias for SearchTerm to match frontend (maps to SearchTerm)
    }
}

