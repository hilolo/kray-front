import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Z_MODAL_DATA } from '../dialog/dialog.service';
import { ZardDialogRef } from '../dialog/dialog-ref';
import { UserService } from '@shared/services/user.service';
import { ZardCheckboxComponent } from '../checkbox/checkbox.component';
import { ZardIconComponent } from '../icon/icon.component';
import type { UserPermissions } from '@shared/models/user-permissions.model';
import { MODULES } from '@shared/constants/modules.constant';
import { Subject, takeUntil } from 'rxjs';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-permissions-dialog',
  standalone: true,
  imports: [FormsModule, ZardCheckboxComponent, ZardIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './permissions-dialog.component.html',
})
export class PermissionsDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(ZardDialogRef);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly data = inject<{ userId: string }>(Z_MODAL_DATA);
  private readonly destroy$ = new Subject<void>();

  permissions = signal<UserPermissions | null>(null);
  isLoading = signal(false);

  readonly modules = MODULES;

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
          toast.error('Failed to load permissions');
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
}

