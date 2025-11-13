export interface Bank {
    id: string;
    companyId: string;
    contactId: string;
    contact?: BankContact;
    bankName?: string;
    rib: string;
    iban?: string;
    swift?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface BankContact {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    isACompany: boolean;
    email?: string;
    phones?: string[];
    identifier: string;
}

export interface CreateBankDto {
    companyId?: string; // Optional - set by backend from user session
    contactId: string;
    bankName?: string;
    rib: string;
    iban?: string;
    swift?: string;
}

export interface UpdateBankDto {
    id: string;
    companyId?: string; // Optional - set by backend from user session
    contactId: string;
    bankName?: string;
    rib: string;
    iban?: string;
    swift?: string;
}

export interface GetBanksFilter {
    currentPage: number;
    pageSize: number;
    searchQuery?: string;
    ignore: boolean;
    companyId?: string;
    contactId?: string;
}

export interface PaginatedResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: T[];
}

export enum BankDialogMode {
    VIEW = 'view',
    ADD = 'add',
    EDIT = 'edit'
}

