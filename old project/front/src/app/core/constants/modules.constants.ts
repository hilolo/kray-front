/**
 * Application Modules Constants
 * Defines all available modules in the application for permission management
 */

export interface ModulePermission {
    id: string;
    name: string;
    description: string;
    icon: string;
    permissions: {
        view: boolean;
        edit: boolean;
        delete: boolean;
    };
}

export const APP_MODULES: ModulePermission[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'View and manage dashboard analytics',
        icon: 'heroicons_outline:chart-bar',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'properties',
        name: 'Properties',
        description: 'Manage property listings',
        icon: 'heroicons_outline:building-office-2',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'buildings',
        name: 'Buildings',
        description: 'Manage building information',
        icon: 'heroicons_outline:building-office',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'leasing',
        name: 'Leasing',
        description: 'Manage lease agreements',
        icon: 'heroicons_outline:document-text',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'reservations',
        name: 'Reservations',
        description: 'Manage property reservations',
        icon: 'heroicons_outline:calendar',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Manage maintenance requests',
        icon: 'heroicons_outline:wrench-screwdriver',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'tasks',
        name: 'Tasks',
        description: 'Plan and track operational tasks',
        icon: 'heroicons_outline:clipboard-document-check',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'contacts',
        name: 'Contacts',
        description: 'Manage contacts (Tenants, Owners, Service Providers)',
        icon: 'heroicons_outline:user-group',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'keys',
        name: 'Keys',
        description: 'Manage property keys',
        icon: 'heroicons_outline:key',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'banks',
        name: 'Banks',
        description: 'Manage bank information',
        icon: 'heroicons_outline:building-library',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'payments',
        name: 'Payments',
        description: 'Manage payments (Revenue and Expenses)',
        icon: 'heroicons_outline:currency-dollar',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'file-manager',
        name: 'File Manager',
        description: 'Manage documents and files',
        icon: 'heroicons_outline:folder',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'reports',
        name: 'Reports',
        description: 'View and generate reports',
        icon: 'heroicons_outline:document-chart-bar',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    },
    {
        id: 'settings',
        name: 'Settings',
        description: 'Manage application settings',
        icon: 'heroicons_outline:cog-6-tooth',
        permissions: {
            view: false,
            edit: false,
            delete: false
        }
    }
];

/**
 * Get module by ID
 */
export function getModuleById(moduleId: string): ModulePermission | undefined {
    return APP_MODULES.find(module => module.id === moduleId);
}

/**
 * Get all module IDs
 */
export function getAllModuleIds(): string[] {
    return APP_MODULES.map(module => module.id);
}

/**
 * Create a default permissions object for all modules
 */
export function createDefaultPermissions(): Record<string, { view: boolean; edit: boolean; delete: boolean }> {
    const permissions: Record<string, { view: boolean; edit: boolean; delete: boolean }> = {};
    APP_MODULES.forEach(module => {
        permissions[module.id] = {
            view: false,
            edit: false,
            delete: false
        };
    });
    return permissions;
}


