export interface Maintenance {
    id: string;
    propertyId: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyImageUrl?: string;
    ownerName?: string;
    ownerPhone?: string;
    companyId: string;
    companyName?: string;
    priority: MaintenancePriority | string | number;
    contactId: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    status: MaintenanceStatus | string | number;
    subject: string;
    description?: string;
    scheduledDateTime: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface CreateMaintenanceDto {
    propertyId: string;
    companyId?: string | null;
    priority: number;
    contactId: string;
    status: number;
    subject: string;
    description?: string;
    scheduledDateTime: string;
}

export interface UpdateMaintenanceDto {
    id: string;
    propertyId: string;
    companyId: string;
    priority: number;
    contactId: string;
    status: number;
    subject: string;
    description?: string;
    scheduledDateTime: string;
}

export interface GetMaintenancesFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    propertyId?: string;
    contactId?: string;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    startDate?: string;
    endDate?: string;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export enum MaintenancePriority {
    Low = 1,
    Medium = 2,
    Urgent = 3
}

export enum MaintenanceStatus {
    Waiting = 1,
    InProgress = 2,
    Done = 3,
    Cancelled = 4
}

export function getMaintenancePriorityLabel(priority: MaintenancePriority | number | string | undefined | null): string {
    if (priority === undefined || priority === null) {
        return 'Unknown';
    }
    
    if (typeof priority === 'string') {
        switch (priority) {
            case 'Low':
                return 'Low';
            case 'Medium':
                return 'Medium';
            case 'Urgent':
                return 'Urgent';
            default:
                return 'Unknown';
        }
    }
    
    const numPriority = typeof priority === 'number' ? priority : Number(priority);
    
    switch (numPriority) {
        case MaintenancePriority.Low:
        case 1:
            return 'Low';
        case MaintenancePriority.Medium:
        case 2:
            return 'Medium';
        case MaintenancePriority.Urgent:
        case 3:
            return 'Urgent';
        default:
            return 'Unknown';
    }
}

export function getMaintenancePriorityColor(priority: MaintenancePriority | number | string | undefined | null): string {
    if (priority === undefined || priority === null) {
        return 'gray';
    }
    
    let numPriority: number;
    if (typeof priority === 'string') {
        switch (priority) {
            case 'Low': numPriority = 1; break;
            case 'Medium': numPriority = 2; break;
            case 'Urgent': numPriority = 3; break;
            default: return 'gray';
        }
    } else {
        numPriority = typeof priority === 'number' ? priority : Number(priority);
    }
    
    switch (numPriority) {
        case MaintenancePriority.Low:
        case 1:
            return 'blue';
        case MaintenancePriority.Medium:
        case 2:
            return 'yellow';
        case MaintenancePriority.Urgent:
        case 3:
            return 'red';
        default:
            return 'gray';
    }
}

export function getMaintenanceStatusLabel(status: MaintenanceStatus | number | string | undefined | null): string {
    if (status === undefined || status === null) {
        return 'Unknown';
    }
    
    if (typeof status === 'string') {
        switch (status) {
            case 'Waiting':
                return 'Waiting';
            case 'InProgress':
                return 'In Progress';
            case 'Done':
                return 'Done';
            case 'Cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    }
    
    const numStatus = typeof status === 'number' ? status : Number(status);
    
    switch (numStatus) {
        case MaintenanceStatus.Waiting:
        case 1:
            return 'Waiting';
        case MaintenanceStatus.InProgress:
        case 2:
            return 'In Progress';
        case MaintenanceStatus.Done:
        case 3:
            return 'Done';
        case MaintenanceStatus.Cancelled:
        case 4:
            return 'Cancelled';
        default:
            return 'Unknown';
    }
}

export function getMaintenanceStatusColor(status: MaintenanceStatus | number | string | undefined | null): string {
    if (status === undefined || status === null) {
        return 'gray';
    }
    
    let numStatus: number;
    if (typeof status === 'string') {
        switch (status) {
            case 'Waiting': numStatus = 1; break;
            case 'InProgress': numStatus = 2; break;
            case 'Done': numStatus = 3; break;
            case 'Cancelled': numStatus = 4; break;
            default: return 'gray';
        }
    } else {
        numStatus = typeof status === 'number' ? status : Number(status);
    }
    
    switch (numStatus) {
        case MaintenanceStatus.Waiting:
        case 1:
            return 'amber';
        case MaintenanceStatus.InProgress:
        case 2:
            return 'blue';
        case MaintenanceStatus.Done:
        case 3:
            return 'green';
        case MaintenanceStatus.Cancelled:
        case 4:
            return 'gray';
        default:
            return 'gray';
    }
}

