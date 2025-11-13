export interface Reservation {
    id: string;
    contactId: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAvatarUrl?: string;
    propertyId: string;
    propertyIdentifier?: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyImageUrl?: string;
    
    // Reservation Information
    startDate: string;
    endDate: string;
    durationDays: number;
    numberOfNights?: number;
    totalAmount?: number;
    
    // Request Information
    reason?: string;
    description?: string;
    requestDate: string;
    
    // Status
    status: ReservationStatus | string | number;
    
    // Approval Information
    approvedBy?: string;
    approvalDate?: string;
    approvalNotes?: string;
    
    // Additional Information
    privateNote?: string;
    
    // Documents
    attachments?: ReservationAttachment[];
    attachmentCount?: number;
    
    // Archive status
    isArchived?: boolean;
    
    // System fields
    companyId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateReservationDto {
    contactId: string;
    propertyId: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    reason?: string;
    description?: string;
    privateNote?: string;
    companyId?: string;
    attachments?: ReservationAttachmentInput[];
}

export interface UpdateReservationDto {
    id: string;
    contactId: string;
    propertyId: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    reason?: string;
    description?: string;
    privateNote?: string;
    status: number;
    approvedBy?: string;
    approvalNotes?: string;
    attachmentsToAdd?: ReservationAttachmentInput[];
    attachmentsToDelete?: string[];
}

export interface GetReservationsFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    contactId?: string;
    propertyId?: string;
    status?: ReservationStatus;
    isArchived?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export interface ReservationAttachment {
    id: string;
    fileName: string;
    originalFileName: string;
    fileExtension: string;
    fileSize: number;
    url?: string;
    createdAt: string;
}

export interface ReservationAttachmentInput {
    fileName: string;
    base64Content: string;
}

export enum ReservationStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3,
    Completed = 4
}

export const ReservationStatusLabels: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: 'Pending',
    [ReservationStatus.Approved]: 'Approved',
    [ReservationStatus.Rejected]: 'Rejected',
    [ReservationStatus.Cancelled]: 'Cancelled',
    [ReservationStatus.Completed]: 'Completed'
};

export const ReservationStatusColors: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: 'bg-yellow-500',
    [ReservationStatus.Approved]: 'bg-green-500',
    [ReservationStatus.Rejected]: 'bg-red-500',
    [ReservationStatus.Cancelled]: 'bg-gray-500',
    [ReservationStatus.Completed]: 'bg-blue-500'
};

// Valid reservation statuses (only Pending, Cancelled, Approved)
export const ValidReservationStatuses = [
    ReservationStatus.Pending,
    ReservationStatus.Cancelled,
    ReservationStatus.Approved
];

// Helper function to get status label
export function getReservationStatusLabel(status: ReservationStatus | string | number | null | undefined): string {
    if (status === null || status === undefined) {
        return 'Unknown';
    }
    
    // If it's already a number, use it directly
    if (typeof status === 'number') {
        return ReservationStatusLabels[status as ReservationStatus] || 'Unknown';
    }
    
    // If it's a string, try to parse it as a number first
    if (typeof status === 'string') {
        // Try parsing as number
        const statusNum = parseInt(status, 10);
        if (!isNaN(statusNum) && ReservationStatusLabels[statusNum as ReservationStatus]) {
            return ReservationStatusLabels[statusNum as ReservationStatus];
        }
        
        // Try matching by enum name (case-insensitive)
        const statusKey = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        const enumKey = Object.keys(ReservationStatus).find(key => 
            key.toLowerCase() === status.toLowerCase()
        ) as keyof typeof ReservationStatus;
        
        if (enumKey && ReservationStatus[enumKey] !== undefined) {
            const enumValue = ReservationStatus[enumKey] as ReservationStatus;
            return ReservationStatusLabels[enumValue] || 'Unknown';
        }
    }
    
    return 'Unknown';
}

// Helper function to calculate number of nights
export function calculateNumberOfNights(startDate: string | Date, endDate: string | Date): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Calendar types
export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

export interface CalendarEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    color: string;
    reservation: Reservation;
    isStartDay?: boolean;
    isEndDay?: boolean;
    isMiddleDay?: boolean;
}
