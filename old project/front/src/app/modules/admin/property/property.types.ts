import { MaintenancePriority, MaintenanceStatus } from '../maintenance/maintenance.types';
import { ContactDto } from '../contacts/contacts.types';
import { Leasing } from '../leasing/leasing.types';
import { Key } from '../keys/keys.types';

export interface Property {
    id: string;
    identifier: string;
    name: string;
    description?: string;
    address: string;
    city?: string;
    typeProperty: string; // Now stored as string in backend
    area: number;
    pieces: number;
    bathrooms: number;
    furnished: boolean;
    price: number;
    typePaiment: PaymentType | string; // Can be number or string from backend
    buildingId?: string;
    contactId: string;
    companyId: string;
    defaultAttachmentId?: string;
    defaultAttachmentUrl?: string;
    features?: string[];
    equipment?: string[];
    category?: PropertyCategory | string; // Can be number or string from backend
    ownerName?: string;
    contact?: ContactDto; // Full contact/owner object
    attachments?: AttachmentDetails[]; // List of attachment details with ID and URL
    createdAt?: string;
    updatedAt?: string;
    isPublic?: boolean;
    isPublicAdresse?: boolean;
    isShared?: boolean;
    maintenances?: PropertyMaintenanceSummary[];
    leases?: Leasing[]; // List of leases for properties of type Location
    keys?: Key[]; // List of keys associated with the property
}

export interface AttachmentDetails {
    id: string;
    url: string;
    fileName: string;
}

export interface PropertyDto {
    id: string;
    identifier: string;
    name: string;
    description?: string;
    address: string;
    city?: string;
    typeProperty: string;
    area: number;
    pieces: number;
    bathrooms: number;
    furnished: boolean;
    price: number;
    typePaiment: string | PaymentType; // Backend returns string
    buildingId?: string;
    contactId: string;
    companyId: string;
    defaultAttachmentId?: string;
    defaultAttachmentUrl?: string;
    features?: string[];
    equipment?: string[];
    category: string | PropertyCategory; // Backend returns string
    ownerName?: string;
    attachments?: AttachmentDetails[]; // List of attachment details with ID and URL
    createdAt?: string; // Read-only, managed by backend
    updatedAt?: string; // Read-only, managed by backend
    isPublic?: boolean;
    isPublicAdresse?: boolean;
    isShared?: boolean;
    maintenances?: PropertyMaintenanceSummary[];
}

export interface CreatePropertyDto {
    identifier: string;
    name: string;
    description: string;
    address: string;
    city: string;
    typeProperty: string;
    area: number;
    pieces: number;
    bathrooms: number;
    furnished: boolean;
    price: number;
    typePaiment: number;
    buildingId?: string;
    contactId: string;
    companyId?: string;
    defaultAttachmentId?: string;
    features?: string[];
    equipment?: string[];
    category: number;
    images?: PropertyImageInput[];
    defaultImageId?: string;
    isPublic?: boolean;
    isPublicAdresse?: boolean;
    isShared?: boolean;
    // Note: createdAt and updatedAt are NOT included - they are managed by the backend
}

export enum PropertySubType {
    SingleUnit = 0,
    MultiUnit = 1
}

export enum PropertyAppType {
    Apartment = 0,
    Villa = 1,
    House = 2,
    Condo = 3,
    Townhouse = 4
}

export interface UpdatePropertyDto {
    id: string;
    identifier: string;
    name: string;
    description?: string;
    address: string;
    city?: string;
    typeProperty: string; // Backend expects string (label), not PropertyType enum
    area: number;
    pieces: number;
    bathrooms: number;
    furnished: boolean;
    price: number;
    typePaiment: number; // Backend expects number for PaymentType
    buildingId?: string;
    contactId: string;
    companyId?: string;
    defaultAttachmentId?: string;
    features?: string[];
    equipment?: string[];
    category: number; // Backend expects number for PropertyCategory
    // Attachment management
    imagesToAdd?: PropertyImageInput[];
    attachmentsToDelete?: string[];
    // Note: createdAt and updatedAt are NOT included - they are managed by the backend
    isPublic?: boolean;
    isPublicAdresse?: boolean;
    isShared?: boolean;
}

export interface GetPropertiesFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    typeProperty?: string;
    category?: PropertyCategory;
    contactId?: string;
    buildingId?: string;
    unattachedOnly?: boolean; // Filter for properties without a building
    city?: string;
    address?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export interface PropertyImage {
    id: string;
    fileName: string;
    url: string;
}

export interface PropertyImageInput {
    fileName: string;
    base64Content: string;
    isDefault?: boolean; // Flag to indicate if this image should be set as default
}

export enum PaymentType {
    Monthly = 0,
    Daily = 1,
    Weekly = 2,
    Fixed = 3
}

export enum PropertyCategory {
    Location = 0,        // Rental
    Vente = 1,          // Sale
    LocationVacances = 2  // Holiday Rental
}

export function getPropertyCategoryLabel(category: PropertyCategory): string {
    switch (category) {
        case PropertyCategory.Location: return 'Location';
        case PropertyCategory.Vente: return 'Vente';
        case PropertyCategory.LocationVacances: return 'Location vacances';
        default: return 'Unknown';
    }
}

export function getPropertyCategoryLabelEn(category: PropertyCategory): string {
    switch (category) {
        case PropertyCategory.Location: return 'Rental';
        case PropertyCategory.Vente: return 'Sale';
        case PropertyCategory.LocationVacances: return 'Holiday Rental';
        default: return 'Unknown';
    }
}

export interface UpdatePropertyVisibilityDto {
    propertyId: string;
    isPublic?: boolean;
    isPublicAdresse?: boolean;
}

export interface PropertyMaintenanceSummary {
    id: string;
    subject?: string;
    status: MaintenanceStatus | number | string;
    priority: MaintenancePriority | number | string;
    scheduledDateTime: string | Date | null;
    description?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface PublicProperty {
    id: string;
    identifier: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    typeProperty?: string;
    area?: number;
    pieces?: number;
    bathrooms?: number;
    furnished?: boolean;
    price?: number;
    typePaiment?: string | PaymentType;
    features?: string[];
    equipment?: string[];
    category?: string | PropertyCategory;
    defaultAttachmentUrl?: string;
    attachments?: AttachmentDetails[];
    isAddressPublic: boolean;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyWebsite?: string;
    companyAddress?: string;
    companyLogoUrl?: string;
}


