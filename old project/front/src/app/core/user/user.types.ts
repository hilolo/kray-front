export interface Company
{
    id: string;
    name: string;
    email: string;
    phone: string;
    website?: string;
    address?: string;
    city?: string;
    rc?: string;
    ice?: string;
    image?: string;
    restricted: boolean;
}

export interface User
{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    role?: string;
    company?: Company;
}

export interface TeamMember
{
    id: string;
    avatar: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    permissions?: Record<string, { view: boolean; edit: boolean; delete: boolean }>;
}

export interface ApiResponse<T>
{
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
    status?: string;
}
