import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, switchMap, of } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { TeamMember, User } from 'app/core/user/user.types';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { APP_MODULES, ModulePermission } from 'app/core/constants/modules.constants';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector       : 'settings-team',
    templateUrl    : './team.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        NgClass,
        NgFor,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatDividerModule,
        NoDataComponent
    ]
})
export class SettingsTeamComponent implements OnInit, OnDestroy
{
    teamMembers: TeamMember[] = [];
    loading: boolean = false;
    selectedMember: TeamMember | null = null;
    modules: ModulePermission[] = [];
    permissionsForm: FormGroup;
    showPermissionsPanel: boolean = false;
    canEditPermissions: boolean = false;
    currentUser: User | null = null;
    savingPermissions: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _errorHandlerService: ErrorHandlerService,
        private _authService: AuthService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get current user and check permissions
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            this.currentUser = user;
            // Only admins can edit permissions
            this.canEditPermissions = user?.role?.toLowerCase() === 'admin';
            this._changeDetectorRef.markForCheck();
        });

        this.loadTeamMembers();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load team members
     */
    loadTeamMembers(): void
    {
        this.loading = true;
        this._changeDetectorRef.markForCheck();

        this._userService.getTeamMembers()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.teamMembers = response.data;
                    } else {
                        this._snackBar.open('Failed to load team members', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading team members:', error);
                    this._snackBar.open('Error loading team members', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Get role display name
     */
    getRoleDisplayName(role: string): string
    {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'Administrator';
            case 'user':
                return 'User';
            default:
                return role;
        }
    }

    /**
     * Get role color class
     */
    getRoleColorClass(role: string): string
    {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'user':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: TeamMember): any
    {
        return item.id || index;
    }

    /**
     * Open permissions panel
     */
    editPermissions(member: TeamMember): void
    {
        // Check if user can edit permissions or is viewing their own
        if (!this.canEditPermissions && member.id !== this.currentUser?.id) {
            this._errorHandlerService.showWarningAlert(
                'Access Denied',
                'You do not have permission to view other users\' permissions'
            );
            return;
        }

        this.selectedMember = member;
        this.showPermissionsPanel = true;
        this.loading = true;
        
        // Load permissions from backend
        this._userService.getUserPermissions(member.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: any) => {
                    this.modules = JSON.parse(JSON.stringify(APP_MODULES)); // Deep clone
                    
                    // Handle both response formats: {success: true} or {status: "Succeed"}
                    const isSuccess = response.success || response.status === 'Succeed';
                    const permissions = response.data?.permissions;
                    
                    if (isSuccess && permissions) {
                        // Load permissions from backend
                        this.modules.forEach(module => {
                            if (permissions[module.id]) {
                                module.permissions = { ...permissions[module.id] };
                            }
                        });
                        
                        // Store in member object for display
                        member.permissions = permissions;
                    }
                    
                    this.buildPermissionsForm();
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading permissions:', error);
                    this._errorHandlerService.showErrorAlert(
                        'Error',
                        'Failed to load permissions'
                    );
                    this.loading = false;
                    this.showPermissionsPanel = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Build the permissions form
     */
    buildPermissionsForm(): void
    {
        const formConfig = {};
        
        this.modules.forEach(module => {
            formConfig[`${module.id}_view`] = [module.permissions.view];
            formConfig[`${module.id}_edit`] = [module.permissions.edit];
            formConfig[`${module.id}_delete`] = [module.permissions.delete];
        });

        this.permissionsForm = this._formBuilder.group(formConfig);
    }

    /**
     * Close permissions panel
     */
    closePermissionsPanel(): void
    {
        this.showPermissionsPanel = false;
        this.selectedMember = null;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save permissions
     */
    savePermissions(): void
    {
        if (!this.selectedMember || !this.canEditPermissions) {
            this._errorHandlerService.showWarningAlert(
                'Access Denied',
                'You do not have permission to edit permissions'
            );
            return;
        }

        const permissions = {};
        
        this.modules.forEach(module => {
            permissions[module.id] = {
                View: this.permissionsForm.get(`${module.id}_view`)?.value || false,
                Edit: this.permissionsForm.get(`${module.id}_edit`)?.value || false,
                Delete: this.permissionsForm.get(`${module.id}_delete`)?.value || false
            };
        });

        this.savingPermissions = true;
        this._changeDetectorRef.markForCheck();

        const isUpdatingCurrentUser = this.selectedMember.id === this.currentUser?.id;

        // Call API to save permissions to backend
        this._userService.updateUserPermissions(this.selectedMember.id, permissions)
            .pipe(
                takeUntil(this._unsubscribeAll),
                // If updating current user's permissions, refresh the JWT token
                switchMap((response: any) => {
                    if (response.success && isUpdatingCurrentUser) {
                        return this._authService.refreshToken().pipe(
                            switchMap(() => of({ ...response, tokenRefreshed: true }))
                        );
                    }
                    return of({ ...response, tokenRefreshed: false });
                })
            )
            .subscribe({
                next: (response: any) => {
                    // Handle both response formats: {success: true} or {status: "Succeed"}
                    const isSuccess = response.success || response.status === 'Succeed';
                    
                    if (isSuccess) {
                        // Update the member's permissions
                        this.selectedMember.permissions = permissions;
                        
                        let successMessage = `Permissions updated for ${this.selectedMember.name}`;
                        if (response.tokenRefreshed) {
                            successMessage += '. Your session has been refreshed with new permissions.';
                        }
                        
                        this._errorHandlerService.showSuccessAlert(
                            'Success!',
                            successMessage
                        );
                        
                        this.closePermissionsPanel();
                    } else {
                        this._errorHandlerService.showErrorAlert(
                            'Error',
                            response.message || 'Failed to update permissions'
                        );
                    }
                    this.savingPermissions = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error saving permissions:', error);
                    this._errorHandlerService.showErrorAlert(
                        'Error',
                        'Failed to save permissions. Please try again.'
                    );
                    this.savingPermissions = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Toggle all permissions for a module
     */
    toggleAllForModule(module: ModulePermission, checked: boolean): void
    {
        this.permissionsForm.patchValue({
            [`${module.id}_view`]: checked,
            [`${module.id}_edit`]: checked,
            [`${module.id}_delete`]: checked
        });
    }

    /**
     * Check if all permissions are selected for a module
     */
    isAllSelected(module: ModulePermission): boolean
    {
        return (
            this.permissionsForm.get(`${module.id}_view`)?.value &&
            this.permissionsForm.get(`${module.id}_edit`)?.value &&
            this.permissionsForm.get(`${module.id}_delete`)?.value
        );
    }

    /**
     * Check if some permissions are selected for a module
     */
    isSomeSelected(module: ModulePermission): boolean
    {
        const view = this.permissionsForm.get(`${module.id}_view`)?.value;
        const edit = this.permissionsForm.get(`${module.id}_edit`)?.value;
        const deleteVal = this.permissionsForm.get(`${module.id}_delete`)?.value;
        
        return (view || edit || deleteVal) && !this.isAllSelected(module);
    }

    /**
     * Select all permissions
     */
    selectAll(): void
    {
        const allSelected = this.modules.every(module => this.isAllSelected(module));
        const newValue = !allSelected;

        this.modules.forEach(module => {
            this.permissionsForm.patchValue({
                [`${module.id}_view`]: newValue,
                [`${module.id}_edit`]: newValue,
                [`${module.id}_delete`]: newValue
            });
        });
    }

    /**
     * Check if all modules have all permissions
     */
    isAllModulesSelected(): boolean
    {
        return this.modules.every(module => this.isAllSelected(module));
    }

    /**
     * Check if any module has some permissions selected (for indeterminate state)
     */
    hasSomeModulesSelected(): boolean
    {
        return this.modules.some(module => this.isAllSelected(module) || this.isSomeSelected(module));
    }

    /**
     * Get permissions summary for a member
     */
    getPermissionsSummary(member: TeamMember): string
    {
        if (!member.permissions) {
            return 'No permissions set';
        }

        const moduleCount = Object.keys(member.permissions).length;
        const grantedCount = Object.values(member.permissions).filter(
            p => p.view || p.edit || p.delete
        ).length;

        if (grantedCount === 0) {
            return 'No permissions granted';
        }

        return `${grantedCount} of ${moduleCount} modules`;
    }

    /**
     * Check if viewing own permissions
     */
    isViewingOwnPermissions(): boolean
    {
        return this.selectedMember?.id === this.currentUser?.id;
    }

    /**
     * Check if user can interact with permissions
     */
    canInteractWithPermissions(): boolean
    {
        return this.canEditPermissions && !this.savingPermissions;
    }
}