import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Z_MODAL_DATA } from '../dialog/dialog.service';
import { ZardDialogRef } from '../dialog/dialog-ref';
import { UserService } from '@shared/services/user.service';
import { ZardCheckboxComponent } from '../checkbox/checkbox.component';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardCardComponent } from '../card/card.component';
import type { UserPermissions } from '@shared/models/user/user-permissions.model';
import { MODULES } from '@shared/constants/modules.constant';
import { Subject, takeUntil, Observable, tap } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-permissions-dialog',
  standalone: true,
  imports: [FormsModule, ZardCheckboxComponent, ZardIconComponent, ZardCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './permissions-dialog.component.html',
})
export class PermissionsDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(ZardDialogRef);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService);
  readonly data = inject<{ userId: string; currentRole?: string }>(Z_MODAL_DATA);
  private readonly destroy$ = new Subject<void>();

  permissions = signal<UserPermissions | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  readonly modules = MODULES;

  /**
   * Get icon for a role based on role value
   */
  getRoleIcon(role: string): 'user' | 'users' {
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('admin')) return 'user';
    return 'users'; // default icon for User role
  }

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPermissions(): void {
    this.isLoading.set(true);
    this.userService.getUserPermissions(this.data.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          this.permissions.set(permissions);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading permissions:', error);
          this.isLoading.set(false);
          this.cdr.markForCheck();
          this.toastService.error('Failed to load permissions');
        }
      });
  }

  getPermission(moduleKey: string, permission: 'view' | 'edit' | 'delete'): boolean {
    const perms = this.permissions();
    if (!perms?.permissions) return false;
    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    return modulePerms?.[permission] ?? false;
  }

  getAllPermission(moduleKey: string): boolean {
    const perms = this.permissions();
    if (!perms?.permissions) return false;
    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    return modulePerms?.view && modulePerms?.edit && modulePerms?.delete || false;
  }

  updatePermission(moduleKey: string, permission: 'view' | 'edit' | 'delete', value: boolean): void {
    const perms = this.permissions();
    if (!perms) return;

    if (!perms.permissions[moduleKey as keyof typeof perms.permissions]) {
      perms.permissions[moduleKey as keyof typeof perms.permissions] = {
        view: false,
        edit: false,
        delete: false,
      };
    }

    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    if (modulePerms) {
      modulePerms[permission] = value;
    }

    this.permissions.set({ ...perms });
    this.cdr.markForCheck();
  }

  updateAllPermission(moduleKey: string, value: boolean): void {
    this.updatePermission(moduleKey, 'view', value);
    this.updatePermission(moduleKey, 'edit', value);
    this.updatePermission(moduleKey, 'delete', value);
  }

  toggleSelectAll(): void {
    const perms = this.permissions();
    if (!perms) return;

    const allSelected = this.modules.every(module => 
      this.getPermission(module.key, 'view') && 
      this.getPermission(module.key, 'edit') && 
      this.getPermission(module.key, 'delete')
    );

    const newValue = !allSelected;

    this.modules.forEach(module => {
      this.updateAllPermission(module.key, newValue);
    });
  }

  /**
   * Save permissions to the API
   */
  savePermissions(): Observable<UserPermissions> {
    const perms = this.permissions();
    if (!perms) {
      throw new Error('No permissions to save');
    }

    this.isSaving.set(true);
    return this.userService.updateUserPermissions(this.data.userId, perms.permissions).pipe(
      tap({
        next: (updatedPermissions) => {
          this.permissions.set(updatedPermissions);
          this.isSaving.set(false);
          this.cdr.markForCheck();
          this.toastService.success('Permissions updated successfully');
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          this.isSaving.set(false);
          this.cdr.markForCheck();
          // Error toast is handled by API interceptor
        }
      })
    );
  }
}

