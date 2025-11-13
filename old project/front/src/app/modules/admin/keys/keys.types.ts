export interface Key {
    id: string;
    name: string;
    description?: string;
    propertyId: string;
    property?: KeyProperty;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface KeyProperty {
    id: string;
    name: string;
    identifier: string;
    address?: string;
    ownerName?: string;
    building?: {
        id: string;
        name: string;
    };
}

export interface CreateKeyDto {
    name: string;
    description?: string;
    propertyId: string;
}

export interface UpdateKeyDto {
    id: string;
    name: string;
    description?: string;
    propertyId: string;
}

export interface GetKeysFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    propertyId?: string;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export enum KeyDialogMode {
    VIEW = 'view',
    ADD = 'add',
    EDIT = 'edit'
}

