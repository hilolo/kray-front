import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModulePermissions {
    view: boolean;
    edit: boolean;
    delete: boolean;
}

/**
 * Permission Service
 * 
 * SECURITY NOTE: Permissions are stored ONLY in memory and extracted from JWT tokens.
 * They are NOT stored in localStorage to prevent client-side tampering.
 * The JWT token is the single source of truth for permissions.
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    // Permissions are stored only in memory (BehaviorSubject)
    // They are populated from JWT token on login/token refresh
    private _permissions: BehaviorSubject<Record<string, ModulePermissions>> = new BehaviorSubject({});
    public permissions$: Observable<Record<string, ModulePermissions>> = this._permissions.asObservable();

    constructor() {
        // No localStorage loading - permissions come from JWT only
        // This prevents users from manually modifying permissions
    }

    /**
     * Set permissions (called only from AuthService after JWT decode)
     * @param permissions - Permissions extracted from JWT token
     */
    setPermissions(permissions: Record<string, ModulePermissions>): void {
        // Store only in memory, NOT in localStorage
        this._permissions.next(permissions);
    }

    /**
     * Get current permissions from memory
     */
    getPermissions(): Record<string, ModulePermissions> {
        return this._permissions.value;
    }

    /**
     * Check if user has specific permission
     * @param module - Module name (e.g., 'properties', 'leases')
     * @param action - Action type ('view', 'edit', 'delete')
     */
    hasPermission(module: string, action: 'view' | 'edit' | 'delete'): boolean {
        const permissions = this._permissions.value;
        return permissions[module]?.[action] || false;
    }

    /**
     * Check if user can view module
     */
    canView(module: string): boolean {
        return this.hasPermission(module, 'view');
    }

    /**
     * Check if user can edit module
     */
    canEdit(module: string): boolean {
        return this.hasPermission(module, 'edit');
    }

    /**
     * Check if user can delete from module
     */
    canDelete(module: string): boolean {
        return this.hasPermission(module, 'delete');
    }

    /**
     * Clear permissions from memory (called on logout)
     */
    clearPermissions(): void {
        // Clear only from memory - no localStorage to remove
        this._permissions.next({});
    }

    /**
     * Check if permissions are loaded in memory
     */
    hasPermissions(): boolean {
        return Object.keys(this._permissions.value).length > 0;
    }
}

