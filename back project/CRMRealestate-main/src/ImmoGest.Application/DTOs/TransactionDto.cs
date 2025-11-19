using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    /// <summary>
    /// Payment DTO for transaction
    /// </summary>
    public class PaymentDto
    {
        public decimal Amount { get; set; }
        public decimal VatPercent { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Full transaction DTO with all details
    /// </summary>
    public class TransactionDto
    {
        public Guid Id { get; set; }
        public TransactionCategory Category { get; set; }
        public RevenueType? RevenueType { get; set; }
        public ExpenseType? ExpenseType { get; set; }
        public TransactionType TransactionType { get; set; }
        public TransactionStatus Status { get; set; }
        public DateTime Date { get; set; }
        public List<PaymentDto> Payments { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? DepositPrice { get; set; }
        public string Description { get; set; }
        
        // Property information
        public Guid? PropertyId { get; set; }
        public string PropertyName { get; set; }
        public string PropertyAddress { get; set; }
        public string PropertyIdentifier { get; set; }
        
        // Lease information (optional)
        public Guid? LeaseId { get; set; }
        public string LeaseTenantName { get; set; }
        
        // Contact information (From for revenue, Pay to for expense)
        public Guid? ContactId { get; set; }
        public string ContactName { get; set; }
        public string OtherContactName { get; set; } // For contacts not in the system
        
        // Reservation information (optional)
        public Guid? ReservationId { get; set; }
        public ReservationDto Reservation { get; set; }
        
        // Company
        public Guid CompanyId { get; set; }
        
        // Attachments
        public List<AttachmentDto> Attachments { get; set; }
        public int AttachmentCount { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Simplified transaction DTO for list view
    /// Shows: date, de/from (contact), montant (amount), description
    /// </summary>
    public class TransactionListDto
    {
        public Guid Id { get; set; }
        public TransactionCategory Category { get; set; }
        public TransactionCategory Type { get; set; } // Alias for Category to match frontend (0=Revenue, 1=Expense)
        public RevenueType? RevenueType { get; set; }
        public ExpenseType? ExpenseType { get; set; }
        public TransactionStatus Status { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; } // Alias for Date to match frontend
        public string ContactName { get; set; } // De/From
        public string ContactIdentifier { get; set; } // Contact reference/identifier
        public string OtherContactName { get; set; } // For contacts not in the system
        public decimal TotalAmount { get; set; } // Montant
        public string Description { get; set; }
        public Guid? PropertyId { get; set; }
        public string PropertyName { get; set; }
        public string PropertyIdentifier { get; set; } // Property identifier
        public string PropertyAddress { get; set; } // Added for frontend display
        public string OwnerName { get; set; } // Property owner name
        public Guid? ReservationId { get; set; }
        public Guid CompanyId { get; set; }
    }

    /// <summary>
    /// Create transaction request DTO
    /// </summary>
    public class CreateTransactionDto
    {
        public TransactionCategory Category { get; set; }
        public RevenueType? RevenueType { get; set; }
        public ExpenseType? ExpenseType { get; set; }
        public Guid? PropertyId { get; set; }
        public Guid? LeaseId { get; set; }
        public Guid? ContactId { get; set; }
        public string OtherContactName { get; set; }
        public Guid? ReservationId { get; set; }
        public DateTime Date { get; set; }
        public List<PaymentDto> Payments { get; set; }
        public decimal? DepositPrice { get; set; }
        public string Description { get; set; }
        public List<AttachmentInput> Attachments { get; set; }
    }

    /// <summary>
    /// Update transaction request DTO
    /// </summary>
    public class UpdateTransactionDto
    {
        public Guid Id { get; set; }
        public TransactionCategory? Category { get; set; }
        public RevenueType? RevenueType { get; set; }
        public ExpenseType? ExpenseType { get; set; }
        public Guid? PropertyId { get; set; }
        public Guid? LeaseId { get; set; }
        public Guid? ContactId { get; set; }
        public string OtherContactName { get; set; }
        public Guid? ReservationId { get; set; }
        public DateTime? Date { get; set; }
        public List<PaymentDto> Payments { get; set; }
        public decimal? DepositPrice { get; set; }
        public string Description { get; set; }
        public TransactionStatus? Status { get; set; }
        public List<AttachmentInput> AttachmentsToAdd { get; set; }
        public List<Guid> AttachmentsToDelete { get; set; }
    }

    /// <summary>
    /// Update transaction status request DTO
    /// </summary>
    public class UpdateTransactionStatusDto
    {
        public TransactionStatus Status { get; set; }
    }

    /// <summary>
    /// Attachment input for transaction creation/update
    /// </summary>
    public class AttachmentInput
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }
        public string Root { get; set; } // Should be "transaction"
    }
}

