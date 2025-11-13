export enum PaymentType {
    Revenue = 0,
    Expense = 1
}

export enum RevenueCategory {
    Loyer = 0,
    Caution = 1,
    FraisAgence = 2,
    VocationFull = 3,
    VocationPart = 4,
    Maintenance = 5,
    Autre = 6
}

export enum ExpenseCategory {
    Maintenance = 0,
    Contact = 1,
    Charge = 2,
    Autre = 3
}

export enum PaymentStatus {
    Paid = 0,
    Overdue = 1,
    Waiting = 2
}

export interface PaymentItem {
    amount: number;
    vat: number; // VAT percentage
    description: string;
}

export interface Payment {
    id: string;
    type: PaymentType;
    category: RevenueCategory | ExpenseCategory;
    status: PaymentStatus;
    items: PaymentItem[];
    description?: string;
    subtotal: number; // Calculated: sum of item amounts
    vatTotal: number; // Calculated: sum of VAT amounts
    total: number; // Calculated: subtotal + vatTotal
    createdAt?: string;
    updatedAt?: string;
    companyId?: string;
}

export interface CreatePaymentDto {
    type: PaymentType;
    category: RevenueCategory | ExpenseCategory;
    status: PaymentStatus;
    items: PaymentItem[];
    description?: string;
    companyId?: string;
}

export interface UpdatePaymentDto {
    id: string;
    type: PaymentType;
    category: RevenueCategory | ExpenseCategory;
    status: PaymentStatus;
    items: PaymentItem[];
    description?: string;
    companyId?: string;
}

export interface GetPaymentsFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    type?: PaymentType;
    status?: PaymentStatus;
    companyId?: string;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

// Helper functions to get labels
export function getPaymentTypeLabel(type: PaymentType | number | string | undefined | null): string {
    if (type === undefined || type === null) {
        return 'Unknown';
    }
    
    if (typeof type === 'string') {
        return type === 'Revenue' ? 'Revenue' : 'Expense';
    }
    
    const numType = typeof type === 'number' ? type : Number(type);
    
    switch (numType) {
        case PaymentType.Revenue:
        case 0:
            return 'Revenue';
        case PaymentType.Expense:
        case 1:
            return 'Expense';
        default:
            return 'Unknown';
    }
}

export function getRevenueCategoryLabel(category: RevenueCategory | number | string | undefined | null): string {
    if (category === undefined || category === null) {
        return 'Unknown';
    }
    
    if (typeof category === 'string') {
        // Handle string enum values
        const categoryMap: { [key: string]: string } = {
            'Loyer': 'Loyer',
            'Caution': 'Caution',
            'FraisAgence': 'Frais d\'agence',
            'VocationFull': 'Vocation full',
            'VocationPart': 'Vocation part',
            'Maintenance': 'Maintenance',
            'Autre': 'Autre'
        };
        return categoryMap[category] || 'Unknown';
    }
    
    const numCategory = typeof category === 'number' ? category : Number(category);
    
    switch (numCategory) {
        case RevenueCategory.Loyer:
        case 0:
            return 'Loyer';
        case RevenueCategory.Caution:
        case 1:
            return 'Caution';
        case RevenueCategory.FraisAgence:
        case 2:
            return 'Frais d\'agence';
        case RevenueCategory.VocationFull:
        case 3:
            return 'Vocation full';
        case RevenueCategory.VocationPart:
        case 4:
            return 'Vocation part';
        case RevenueCategory.Maintenance:
        case 5:
            return 'Maintenance';
        case RevenueCategory.Autre:
        case 6:
            return 'Autre';
        default:
            return 'Unknown';
    }
}

export function getExpenseCategoryLabel(category: ExpenseCategory | number | string | undefined | null): string {
    if (category === undefined || category === null) {
        return 'Unknown';
    }
    
    if (typeof category === 'string') {
        const categoryMap: { [key: string]: string } = {
            'Maintenance': 'Maintenance',
            'Contact': 'Contact',
            'Charge': 'Charge',
            'Autre': 'Autre'
        };
        return categoryMap[category] || 'Unknown';
    }
    
    const numCategory = typeof category === 'number' ? category : Number(category);
    
    switch (numCategory) {
        case ExpenseCategory.Maintenance:
        case 0:
            return 'Maintenance';
        case ExpenseCategory.Contact:
        case 1:
            return 'Contact';
        case ExpenseCategory.Charge:
        case 2:
            return 'Charge';
        case ExpenseCategory.Autre:
        case 3:
            return 'Autre';
        default:
            return 'Unknown';
    }
}

export function getPaymentStatusLabel(status: PaymentStatus | number | string | undefined | null): string {
    if (status === undefined || status === null) {
        return 'Unknown';
    }
    
    if (typeof status === 'string') {
        const statusMap: { [key: string]: string } = {
            'Paid': 'Paid',
            'Overdue': 'Overdue',
            'Waiting': 'Waiting'
        };
        return statusMap[status] || 'Unknown';
    }
    
    const numStatus = typeof status === 'number' ? status : Number(status);
    
    switch (numStatus) {
        case PaymentStatus.Paid:
        case 0:
            return 'Paid';
        case PaymentStatus.Overdue:
        case 1:
            return 'Overdue';
        case PaymentStatus.Waiting:
        case 2:
            return 'Waiting';
        default:
            return 'Unknown';
    }
}


