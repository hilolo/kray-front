export type ContactType = 'tenant' | 'owner' | 'service';

// Backend enum mapping
export enum ContactTypeEnum {
    Owner = 0,
    Tenant = 1,
    Service = 2,
    Pro = 3
}

export function mapContactTypeToEnum(type: ContactType): ContactTypeEnum {
    switch (type) {
        case 'owner': return ContactTypeEnum.Owner;
        case 'tenant': return ContactTypeEnum.Tenant;
        case 'service': return ContactTypeEnum.Service;
        default: return ContactTypeEnum.Tenant;
    }
}

export function mapEnumToContactType(enumValue: ContactTypeEnum): ContactType {
    switch (enumValue) {
        case ContactTypeEnum.Owner: return 'owner';
        case ContactTypeEnum.Tenant: return 'tenant';
        case ContactTypeEnum.Service: 
        case ContactTypeEnum.Pro: 
            return 'service';
        default: return 'tenant';
    }
}

export interface Contact
{
    id: string;
    type: ContactType;
    avatar?: string | null;
    background?: string | null;
    name: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    companyName?: string;
    ice?: string;
    rc?: string;
    identifier?: string;
    email?: string;
    emails?: {
        email: string;
        label: string;
    }[];
    phones?: string[];
    phoneNumbers?: {
        country: string;
        phoneNumber: string;
        label: string;
    }[];
    title?: string;
    company?: string;
    birthday?: string | null;
    dateOfBirth?: string | null;
    age?: number;
    address?: string | null;
    notes?: string | null;
    tags: string[];
    isACompany?: boolean;
    attachments?: Attachment[];
    attachmentCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateContactDto {
    firstName: string;
    lastName: string;
    companyName?: string;
    ice?: string;
    rc?: string;
    identifier: string;
    type: ContactTypeEnum;
    isACompany: boolean;
    email: string;
    phones?: string[];
    avatar?: string;
    attachments?: AttachmentInput[];
    companyId?: string;
}

export interface UpdateContactDto {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    ice?: string;
    rc?: string;
    identifier: string;
    email: string;
    phones?: string[];
    avatar?: string;
    attachmentsToAdd?: AttachmentInput[];
    attachmentsToDelete?: string[];
    companyId?: string;
}

export interface ContactDto {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    ice?: string;
    rc?: string;
    identifier: string;
    type: ContactTypeEnum;
    isACompany: boolean;
    email: string;
    phones?: string[];
    avatar?: string;
    attachments?: Attachment[];
    attachmentCount?: number;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    properties?: any[]; // PropertyDto[]
    leases?: any[]; // LeaseDto[]
    banks?: any[]; // BankDto[]
}

export interface GetContactsFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    type?: ContactTypeEnum;
    isACompany?: boolean;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export interface Country
{
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface Tag
{
    id?: string;
    title?: string;
}

export interface Attachment {
    id: string;
    fileName: string;
    originalFileName: string;
    fileExtension: string;
    fileSize: number;
    root?: string;
    contactId?: string;
    url: string;
    createdAt: string;
}

export interface AttachmentInput {
    fileName: string;
    base64Content: string;
    root?: string;
    contactId?: string;
}
