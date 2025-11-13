import { Property } from '../property/property.types';

export interface Building {
    id: string;
    name: string;
    address: string;
    city: string;
    year: number;
    description?: string;
    floor: number;
    defaultAttachmentId?: string;
    defaultAttachmentUrl?: string;
    companyId: string;
    properties?: Property[];
    propertiesCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface BuildingDto {
    id: string;
    name: string;
    address: string;
    city: string;
    year: number;
    description?: string;
    floor: number;
    defaultAttachmentId?: string;
    defaultAttachmentUrl?: string;
    companyId: string;
    properties?: Property[];
    propertiesCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBuildingDto {
    name: string;
    address: string;
    city: string;
    year: number;
    description?: string;
    floor: number;
    defaultAttachmentId?: string;
    image?: BuildingImageInput;
}

export interface UpdateBuildingDto {
    id: string;
    name: string;
    address: string;
    city: string;
    year: number;
    description?: string;
    floor: number;
    defaultAttachmentId?: string;
    image?: BuildingImageInput;
}

export interface BuildingImageInput {
    fileName: string;
    base64Content: string;
}

export interface GetBuildingsFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    city?: string;
    address?: string;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

