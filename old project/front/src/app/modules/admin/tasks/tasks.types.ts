export enum TaskPriority {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

export enum TaskStatus {
    ToDo = 1,
    InProgress = 2,
    Completed = 3
}

// Helper functions to convert string enum values from API to numeric enum values
export function parseTaskStatus(status: string | TaskStatus): TaskStatus {
    if (typeof status === 'number') {
        return status;
    }
    switch (status) {
        case 'ToDo':
            return TaskStatus.ToDo;
        case 'InProgress':
            return TaskStatus.InProgress;
        case 'Completed':
            return TaskStatus.Completed;
        default:
            return TaskStatus.ToDo;
    }
}

export function parseTaskPriority(priority: string | TaskPriority): TaskPriority {
    if (typeof priority === 'number') {
        return priority;
    }
    switch (priority) {
        case 'Low':
            return TaskPriority.Low;
        case 'Medium':
            return TaskPriority.Medium;
        case 'High':
            return TaskPriority.High;
        case 'Critical':
            return TaskPriority.Critical;
        default:
            return TaskPriority.Medium;
    }
}

// Helper functions to convert numeric enum values to strings for API
export function taskStatusToString(status: TaskStatus): string {
    switch (status) {
        case TaskStatus.ToDo:
            return 'ToDo';
        case TaskStatus.InProgress:
            return 'InProgress';
        case TaskStatus.Completed:
            return 'Completed';
        default:
            return 'ToDo';
    }
}

export function taskPriorityToString(priority: TaskPriority): string {
    switch (priority) {
        case TaskPriority.Low:
            return 'Low';
        case TaskPriority.Medium:
            return 'Medium';
        case TaskPriority.High:
            return 'High';
        case TaskPriority.Critical:
            return 'Critical';
        default:
            return 'Medium';
    }
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus | string; // Accept both for API compatibility
    priority: TaskPriority | string; // Accept both for API compatibility
    scheduledDateTime: string;
    assignedUserId: string;
    assignedUserName?: string;
    contactId?: string;
    contactName?: string;
    propertyId?: string;
    propertyName?: string;
    createdOn?: string;
    updatedOn?: string;
}

export interface PaginatedTaskResult {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    result: Task[];
}

export interface GetTasksFilter {
    searchQuery?: string;
    month: number;
    year: number;
    includeContacts?: boolean;
    includeProperties?: boolean;
    assignedUserId?: string;
    contactId?: string;
    propertyId?: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    scheduledDateTime: string;
    assignedUserId: string;
    contactId?: string;
    propertyId?: string;
}

export interface UpdateTaskDto extends CreateTaskDto {
}

export function getTaskStatusLabel(status: TaskStatus | string): string {
    const normalizedStatus = parseTaskStatus(status);
    switch (normalizedStatus) {
        case TaskStatus.ToDo:
            return 'To Do';
        case TaskStatus.InProgress:
            return 'In Progress';
        case TaskStatus.Completed:
            return 'Completed';
        default:
            return 'Unknown';
    }
}

export function getTaskStatusColor(status: TaskStatus | string): string {
    const normalizedStatus = parseTaskStatus(status);
    switch (normalizedStatus) {
        case TaskStatus.ToDo:
            return 'sky';
        case TaskStatus.InProgress:
            return 'violet';
        case TaskStatus.Completed:
            return 'emerald';
        default:
            return 'slate';
    }
}

export function getTaskPriorityLabel(priority: TaskPriority | string): string {
    const normalizedPriority = parseTaskPriority(priority);
    switch (normalizedPriority) {
        case TaskPriority.Low:
            return 'Low';
        case TaskPriority.Medium:
            return 'Medium';
        case TaskPriority.High:
            return 'High';
        case TaskPriority.Critical:
            return 'Critical';
        default:
            return 'Unknown';
    }
}

export function getTaskPriorityColor(priority: TaskPriority): string {
    switch (priority) {
        case TaskPriority.Low:
            return 'emerald';
        case TaskPriority.Medium:
            return 'sky';
        case TaskPriority.High:
            return 'amber';
        case TaskPriority.Critical:
            return 'rose';
        default:
            return 'slate';
    }
}


