export interface Leasing {
    id: string;
    propertyId: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyImageUrl?: string;
    contactId: string;
    tenantName?: string;
    tenantEmail?: string;
    tenantPhone?: string;
    tenantAvatarUrl?: string;
    
    // Tenancy Information
    tenancyStart: string;
    tenancyEnd: string;
    tenancyDuration?: number; // Calculated in months
    
    // Payment Information
    paymentType: PaymentType | string | number; // Can be string from JsonStringEnumConverter
    paymentMethod: PaymentMethod | string | number; // Can be string from JsonStringEnumConverter
    paymentDate: number; // Day of month (1-31)
    rentPrice: number;
    
    // Receipt Information
    enableReceipts: boolean;
    notificationWhatsapp: boolean;
    notificationEmail: boolean;
    
    // Additional Information
    specialTerms?: string;
    privateNote?: string;
    
    // Documents
    attachments?: LeasingAttachment[];
    attachmentCount?: number;
    
    // Status
    status?: LeasingStatus | string | number; // Can be string from JsonStringEnumConverter
    isArchived?: boolean;
    
    // System fields
    companyId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateLeasingDto {
    propertyId: string;
    contactId: string;
    tenancyStart: string;
    tenancyEnd: string;
    paymentType: number;
    paymentMethod: number;
    paymentDate: number;
    rentPrice: number;
    enableReceipts: boolean;
    notificationWhatsapp: boolean;
    notificationEmail: boolean;
    specialTerms?: string;
    privateNote?: string;
    companyId?: string;
    attachments?: LeasingAttachmentInput[];
}

export interface UpdateLeasingDto {
    id: string;
    propertyId: string;
    contactId: string;
    tenancyStart: string;
    tenancyEnd: string;
    paymentType: number;
    paymentMethod: number;
    paymentDate: number;
    rentPrice: number;
    enableReceipts: boolean;
    notificationWhatsapp: boolean;
    notificationEmail: boolean;
    specialTerms?: string;
    privateNote?: string;
    companyId?: string;
    attachmentsToAdd?: LeasingAttachmentInput[];
    attachmentsToDelete?: string[];
}

export interface GetLeasingsFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    propertyId?: string;
    contactId?: string;
    status?: LeasingStatus;
    isArchived?: boolean;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export interface LeasingAttachment {
    id: string;
    fileName: string;
    originalFileName: string;
    fileExtension: string;
    fileSize: number;
    url: string;
    leasingId?: string;
    createdAt: string;
}

export interface LeasingAttachmentInput {
    fileName: string;
    base64Content: string;
    leasingId?: string;
}

export enum PaymentType {
    Monthly = 0,
    Quarterly = 1,      // Trimestrial (3 months)
    SemiAnnually = 2,   // 6 months
    Fully = 3           // Full payment
}

export enum PaymentMethod {
    Cash = 0,
    BankTransfer = 1,
    Check = 2
}

export enum LeasingStatus {
    Active = 0,
    Expired = 1,
    Terminated = 2,
    Pending = 3
}

export function getPaymentTypeLabel(type: PaymentType | number | string | undefined | null): string {
    // Handle undefined or null
    if (type === undefined || type === null) {
        return 'Unknown';
    }
    
    // Handle string enum values from backend (JsonStringEnumConverter)
    if (typeof type === 'string') {
        switch (type) {
            case 'Monthly':
                return 'Monthly';
            case 'Quarterly':
                return 'Quarterly';
            case 'SemiAnnually':
                return 'Semi-Annually';
            case 'Fully':
                return 'Full Payment';
            default:
                return 'Unknown';
        }
    }
    
    // Handle numeric enum values
    const numType = typeof type === 'number' ? type : Number(type);
    
    switch (numType) {
        case PaymentType.Monthly:
        case 0:
            return 'Monthly';
        case PaymentType.Quarterly:
        case 1:
            return 'Quarterly';
        case PaymentType.SemiAnnually:
        case 2:
            return 'Semi-Annually';
        case PaymentType.Fully:
        case 3:
            return 'Full Payment';
        default:
            return 'Unknown';
    }
}

export function getPaymentMethodLabel(method: PaymentMethod | number | string | undefined | null): string {
    // Handle undefined or null
    if (method === undefined || method === null) {
        return 'Unknown';
    }
    
    // Handle string enum values from backend (JsonStringEnumConverter)
    if (typeof method === 'string') {
        switch (method) {
            case 'Cash':
                return 'Cash';
            case 'BankTransfer':
                return 'Bank Transfer';
            case 'Check':
                return 'Check';
            default:
                return 'Unknown';
        }
    }
    
    // Handle numeric enum values
    const numMethod = typeof method === 'number' ? method : Number(method);
    
    switch (numMethod) {
        case PaymentMethod.Cash:
        case 0:
            return 'Cash';
        case PaymentMethod.BankTransfer:
        case 1:
            return 'Bank Transfer';
        case PaymentMethod.Check:
        case 2:
            return 'Check';
        default:
            return 'Unknown';
    }
}

export function getLeasingStatusLabel(status: LeasingStatus | number | string | undefined | null): string {
    // Handle undefined or null
    if (status === undefined || status === null) {
        return 'Unknown';
    }
    
    // Handle string enum values from backend (JsonStringEnumConverter)
    if (typeof status === 'string') {
        switch (status) {
            case 'Active':
                return 'Active';
            case 'Expired':
                return 'Expired';
            case 'Terminated':
                return 'Terminated';
            case 'Pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    }
    
    // Handle numeric enum values
    const numStatus = typeof status === 'number' ? status : Number(status);
    
    switch (numStatus) {
        case LeasingStatus.Active:
        case 0:
            return 'Active';
        case LeasingStatus.Expired:
        case 1:
            return 'Expired';
        case LeasingStatus.Terminated:
        case 2:
            return 'Terminated';
        case LeasingStatus.Pending:
        case 3:
            return 'Pending';
        default:
            return 'Unknown';
    }
}

export interface TenancyDuration {
    years: number;
    months: number;
    days: number;
    totalDays: number;
}

export function calculateTenancyDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round(diffDays / 30); // Approximate months (for backward compatibility)
}

export function calculateDetailedTenancyDuration(startDate: string, endDate: string): TenancyDuration {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    
    // Adjust if days are negative
    if (days < 0) {
        months--;
        const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    // Adjust if months are negative
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Calculate total days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { years, months, days, totalDays };
}

export function formatTenancyDuration(duration: TenancyDuration): string {
    const parts: string[] = [];
    
    if (duration.years > 0) {
        parts.push(`${duration.years} ${duration.years === 1 ? 'year' : 'years'}`);
    }
    
    if (duration.months > 0) {
        parts.push(`${duration.months} ${duration.months === 1 ? 'month' : 'months'}`);
    }
    
    if (duration.days > 0 || parts.length === 0) {
        parts.push(`${duration.days} ${duration.days === 1 ? 'day' : 'days'}`);
    }
    
    return parts.join(', ');
}


