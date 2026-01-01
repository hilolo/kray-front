import { Component, computed, effect, ElementRef, inject, signal, TemplateRef, viewChild, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardPageComponent } from '../page/page.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardAccordionComponent } from '@shared/components/accordion/accordion.component';
import { ZardAccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import type { TeamMember } from '@shared/models/user/team-member.model';
import { ThemeService, type ThemePreset } from '@shared/services/theme.service';
import { SettingsService } from '@shared/services/settings.service';
import type { Settings } from '@shared/models/settings/settings.model';
import type { Category } from '@shared/models/settings/category.model';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import type { UserPermissions } from '@shared/models/user/user-permissions.model';
import { MODULES } from '@shared/constants/modules.constant';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type SettingsSection = 'account' | 'security' | 'team' | 'application';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    ZardPageComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCardComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAvatarComponent,
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardBadgeComponent,
    ZardCheckboxComponent,
    TranslateModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly toastService = inject(ToastService);
  private readonly themeService = inject(ThemeService);
  private readonly settingsService = inject(SettingsService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  activeSection = signal<SettingsSection>('account');

  // Icon templates for input groups
  userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');
  phoneIconTemplate = viewChild.required<TemplateRef<void>>('phoneIconTemplate');
  buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  building2IconTemplate = viewChild.required<TemplateRef<void>>('building2IconTemplate');
  mapPinIconTemplate = viewChild.required<TemplateRef<void>>('mapPinIconTemplate');
  globeIconTemplate = viewChild.required<TemplateRef<void>>('globeIconTemplate');
  lockIconTemplate = viewChild.required<TemplateRef<void>>('lockIconTemplate');

  // File input reference
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  
  // Signature file input reference
  signatureFileInput = viewChild.required<ElementRef<HTMLInputElement>>('signatureFileInput');

  // User Information
  userInfo = {
    fullName: signal(''),
    phone: signal(''),
    email: '',
  };

  // Loading state for save operation
  isSaving = signal(false);

  // Form validation state
  formSubmitted = signal(false);

  // Profile image
  profileImageUrl = signal<string | null>(null);
  profileImageFile = signal<File | null>(null);

  // Computed signal to check if account form is valid (all required fields filled)
  readonly isAccountFormValid = computed(() => {
    return this.userInfo.fullName() && this.userInfo.fullName().trim() !== '';
  });

  // Computed signals for error messages
  readonly fullNameError = computed(() => {
    if (!this.formSubmitted()) return '';
    const fullName = this.userInfo.fullName();
    if (!fullName || fullName.trim() === '') {
      return this.translateService.instant('settings.account.userInformation.fullNameRequired');
    }
    return '';
  });

  // Computed signal to check if full name input has error
  readonly fullNameHasError = computed(() => {
    return this.formSubmitted() && (!this.userInfo.fullName() || this.userInfo.fullName().trim() === '');
  });

  // Company Information (read-only) - populated from user service
  companyInfo = {
    name: '',
    address: '',
    city: '',
    phone: '',
    website: '',
    rc: '',
    ice: '',
    image: '',
  };

  /**
   * Get formatted company image URL
   * Ensures base64 images have the proper data URL prefix
   */
  getCompanyImageUrl(): string {
    const image = this.companyInfo.image;
    if (!image) return '';
    
    // If it already has data URL prefix, return as is
    if (image.startsWith('data:')) {
      return image;
    }
    
    // Otherwise, assume it's a base64 string and add the prefix
    // Default to image/png if we can't determine the type
    return `data:image/png;base64,${image}`;
  }

  /**
   * Get formatted signature image URL
   * Ensures base64 images have the proper data URL prefix
   */
  getSignatureImageUrl(signature?: string): string {
    const sig = signature || this.signatureImageUrl();
    if (!sig) return '';
    
    // If it already has data URL prefix, return as is
    if (sig.startsWith('data:')) {
      return sig;
    }
    
    // Otherwise, assume it's a base64 string and add the prefix
    // Default to image/png if we can't determine the type
    return `data:image/png;base64,${sig}`;
  }

  // Password Form
  passwordForm = {
    currentPassword: signal(''),
    newPassword: signal(''),
    confirmPassword: signal(''),
  };
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Password form validation state
  passwordFormSubmitted = signal(false);

  // Loading state for password update
  isUpdatingPassword = signal(false);

  // Team Members
  teamMembers = signal<TeamMember[]>([]);
  isLoadingTeamMembers = signal(false);

  // Invitation Form
  invitationForm = {
    email: signal(''),
    role: signal('User'), // Default role
  };
  isInviting = signal(false);
  invitationFormSubmitted = signal(false);

  // Computed signal to check if invitation form is valid
  readonly isInvitationFormValid = computed(() => {
    const email = this.invitationForm.email();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return email && email.trim() !== '' && emailRegex.test(email);
  });

  // Computed signals for invitation error messages
  readonly invitationEmailError = computed(() => {
    if (!this.invitationFormSubmitted()) return '';
    const email = this.invitationForm.email();
    if (!email || email.trim() === '') {
      return this.translateService.instant('settings.team.inviteTeamMember.emailRequired');
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return this.translateService.instant('settings.team.inviteTeamMember.invalidEmail');
    }
    return '';
  });

  readonly invitationEmailHasError = computed(() => {
    return this.invitationFormSubmitted() && !!this.invitationEmailError();
  });

  // Permissions state for each user
  userPermissions = signal<Map<string, UserPermissions | null>>(new Map());
  isLoadingPermissions = signal<Map<string, boolean>>(new Map());
  isSavingPermissions = signal<Map<string, boolean>>(new Map());
  editingUserId = signal<string | null>(null);

  readonly modules = MODULES;

  // Application Settings
  appSettings = {
  };

  // Theme settings
  readonly currentTheme = this.themeService.getCurrentThemeSignal();
  readonly themePresets = this.themeService.themePresets;

  // Property Settings
  propertySettings = {
    defaultCity: signal(''),
    categories: signal<Category[]>([]),
    features: signal<string[]>([]),
    amenities: signal<string[]>([]),
    propertyTypes: signal<string[]>([]),
  };

  // Loading state for property settings
  isLoadingPropertySettings = signal(false);
  isSavingPropertySettings = signal(false);

  // Notification Settings
  notificationSettings = {
    lease: {
      overdue: signal(''),
      pending: signal(''),
      paid: signal(''),
    },
    maintenance: {
      paid: signal(''),
    },
    reservation: {
      confirmation: signal(''),
      enter: signal(''),
      left: signal(''),
    },
  };

  // Loading state for notification settings
  isLoadingNotificationSettings = signal(false);
  isSavingNotificationSettings = signal(false);

  // Signature Settings
  signatureImageUrl = signal<string | null>(null);
  signatureImageFile = signal<File | null>(null);
  isSavingSignature = signal(false);

  // Input states for adding new items
  showAddPropertyTypeInput = signal(false);
  showAddFeatureInput = signal(false);
  showAddAmenityInput = signal(false);
  newPropertyType = signal('');
  newFeature = signal('');
  newAmenity = signal('');

  onThemeChange(theme: string): void {
    this.themeService.setTheme(theme as ThemePreset);
  }

  /**
   * Get icon for a role based on role value
   */
  getRoleIcon(role: string): 'user' | 'users' {
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('admin')) return 'user';
    return 'users'; // default icon for User role
  }

  /**
   * Check if a team member is the current user
   */
  isCurrentUser(member: TeamMember): boolean {
    const user = this.currentUser();
    if (!user || !user.id) return false;
    return user.id === member.id;
  }

  // Computed signals for reactive user and company data
  readonly currentUser = computed(() => this.userService.getCurrentUser());
  readonly currentCompany = computed(() => this.userService.company());

  constructor() {
    // Use effect to reactively update user and company info when data changes
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.userInfo.email = user.email || '';
        this.userInfo.fullName.set(user.name || '');
        this.userInfo.phone.set(user.phone || '');

        // Update profile image if avatar exists
        if (user.avatar && !this.profileImageUrl()) {
          this.profileImageUrl.set(user.avatar);
        }
      }
    });

    effect(() => {
      const company = this.currentCompany();
      if (company) {
        this.companyInfo = {
          name: company.name || '',
          address: company.address || '',
          city: company.city || '',
          phone: company.phone || '',
          website: company.website || '',
          rc: company.rc || '',
          ice: company.ice || '',
          image: company.image || '',
        };
      }
    });
  }

  ngOnInit(): void {
    // Initial population (effects will handle updates)
    const user = this.currentUser();
    if (user) {
      this.userInfo.email = user.email || '';
      this.userInfo.fullName.set(user.name || '');
      this.userInfo.phone.set(user.phone || '');

      // Set profile image if avatar exists
      if (user.avatar) {
        this.profileImageUrl.set(user.avatar);
      }
    }

    const company = this.currentCompany();
    if (company) {
      this.companyInfo = {
        name: company.name || '',
        address: company.address || '',
        city: company.city || '',
        phone: company.phone || '',
        website: company.website || '',
        rc: company.rc || '',
        ice: company.ice || '',
        image: company.image || '',
      };
    }

    // Load team members
    this.loadTeamMembers();

    // Load property settings
    this.loadPropertySettings();

    // Load notification settings
    this.loadNotificationSettings();
  }

  /**
   * Load team members from API
   */
  loadTeamMembers(): void {
    this.isLoadingTeamMembers.set(true);
    this.userService.getTeamMembers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.teamMembers.set(members);
          this.isLoadingTeamMembers.set(false);
        },
        error: (error) => {
          console.error('Error loading team members:', error);
          this.isLoadingTeamMembers.set(false);
          this.toastService.error(this.translateService.instant('settings.team.failedToLoadTeamMembers'));
        }
      });
  }

  /**
   * Delete a team member
   */
  deleteTeamMember(member: TeamMember): void {
    if (this.isCurrentUser(member)) {
      this.toastService.error(this.translateService.instant('settings.team.cannotDeleteOwnAccount'));
      return;
    }

    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('settings.team.deleteTeamMember'),
      zDescription: this.translateService.instant('settings.team.deleteTeamMemberConfirm', { name: member.name || member.email }),
      zOkText: this.translateService.instant('settings.team.deleteTeamMemberButton'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(member.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success(this.translateService.instant('settings.team.teamMemberDeleted'));
              // Reload team members to refresh the list
              this.loadTeamMembers();
              // Close permissions if this user was being edited
              if (this.editingUserId() === member.id) {
                this.editingUserId.set(null);
              }
            },
            error: (error) => {
              console.error('Error deleting team member:', error);
              this.toastService.error(this.translateService.instant('settings.team.failedToDeleteTeamMember'));
            }
          });
      }
    });
  }

  /**
   * Invite a new team member
   */
  inviteMember(): void {
    this.invitationFormSubmitted.set(true);

    if (!this.isInvitationFormValid()) {
      return;
    }

    // Check limit (max 2 extra users + 1 admin = 3 total)
    if (this.teamMembers().length >= 3) {
      this.toastService.error(this.translateService.instant('settings.team.inviteTeamMember.maxTeamMembersReached'));
      return;
    }

    this.isInviting.set(true);

    const inviteData = {
      email: this.invitationForm.email().trim(),
      role: this.invitationForm.role(),
    };

    this.userService.inviteTeamMember(inviteData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newMember) => {
          this.isInviting.set(false);
          this.invitationFormSubmitted.set(false);
          this.invitationForm.email.set('');
          this.invitationForm.role.set('User');

          this.toastService.success(this.translateService.instant('settings.team.inviteTeamMember.invitationSent', { email: inviteData.email }));

          // Add new member to the list
          this.teamMembers.update(members => [...members, newMember]);
        },
        error: (error) => {
          this.isInviting.set(false);
          console.error('Error inviting team member:', error);

          if (error.error?.code === 'user_already_exists') {
            this.toastService.error(this.translateService.instant('settings.team.inviteTeamMember.userAlreadyExists'));
          } else if (error.error?.code === 'team_limit_reached') {
            const errorMessage = error.error?.message || this.translateService.instant('settings.team.inviteTeamMember.teamLimitReached');
            this.toastService.error(errorMessage);
          } else {
            this.toastService.error(this.translateService.instant('settings.team.inviteTeamMember.failedToSendInvitation'));
          }
        }
      });
  }

  /**
   * Toggle permissions editing for a team member
   */
  togglePermissions(member: TeamMember): void {
    const currentEditing = this.editingUserId();
    if (currentEditing === member.id) {
      // Close permissions
      this.editingUserId.set(null);
    } else {
      // Open permissions for this user
      this.editingUserId.set(member.id);
      // Load permissions if not already loaded
      if (!this.userPermissions().has(member.id)) {
        this.loadUserPermissions(member.id);
      }
    }
  }

  /**
   * Load permissions for a user
   */
  loadUserPermissions(userId: string): void {
    const loadingMap = new Map(this.isLoadingPermissions());
    loadingMap.set(userId, true);
    this.isLoadingPermissions.set(loadingMap);

    this.userService.getUserPermissions(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          const permsMap = new Map(this.userPermissions());
          permsMap.set(userId, permissions);
          this.userPermissions.set(permsMap);

          const loadingMap = new Map(this.isLoadingPermissions());
          loadingMap.set(userId, false);
          this.isLoadingPermissions.set(loadingMap);
        },
        error: (error) => {
          console.error('Error loading permissions:', error);
          const loadingMap = new Map(this.isLoadingPermissions());
          loadingMap.set(userId, false);
          this.isLoadingPermissions.set(loadingMap);
          this.toastService.error(this.translateService.instant('settings.team.failedToLoadPermissions'));
        }
      });
  }

  /**
   * Get permissions for a user
   */
  getUserPermissions(userId: string): UserPermissions | null {
    return this.userPermissions().get(userId) || null;
  }

  /**
   * Check if permissions are loading for a user
   */
  isUserPermissionsLoading(userId: string): boolean {
    return this.isLoadingPermissions().get(userId) || false;
  }

  /**
   * Check if permissions are saving for a user
   */
  isUserPermissionsSaving(userId: string): boolean {
    return this.isSavingPermissions().get(userId) || false;
  }

  /**
   * Get permission value for a module
   */
  getPermission(userId: string, moduleKey: string, permission: 'view' | 'edit' | 'delete'): boolean {
    const perms = this.getUserPermissions(userId);
    if (!perms?.permissions) return false;
    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    return modulePerms?.[permission] ?? false;
  }

  /**
   * Get all permissions for a module
   */
  getAllPermission(userId: string, moduleKey: string): boolean {
    const perms = this.getUserPermissions(userId);
    if (!perms?.permissions) return false;
    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    return modulePerms?.view && modulePerms?.edit && modulePerms?.delete || false;
  }

  /**
   * Update permission value
   */
  updatePermission(userId: string, moduleKey: string, permission: 'view' | 'edit' | 'delete', value: boolean): void {
    const perms = this.getUserPermissions(userId);
    if (!perms) return;

    const updatedPerms = { ...perms };
    if (!updatedPerms.permissions[moduleKey as keyof typeof updatedPerms.permissions]) {
      updatedPerms.permissions[moduleKey as keyof typeof updatedPerms.permissions] = {
        view: false,
        edit: false,
        delete: false,
      };
    }

    const modulePerms = updatedPerms.permissions[moduleKey as keyof typeof updatedPerms.permissions];
    if (modulePerms) {
      modulePerms[permission] = value;
    }

    const permsMap = new Map(this.userPermissions());
    permsMap.set(userId, updatedPerms);
    this.userPermissions.set(permsMap);
  }

  /**
   * Update all permissions for a module
   */
  updateAllPermission(userId: string, moduleKey: string, value: boolean): void {
    this.updatePermission(userId, moduleKey, 'view', value);
    this.updatePermission(userId, moduleKey, 'edit', value);
    this.updatePermission(userId, moduleKey, 'delete', value);
  }

  /**
   * Toggle select all permissions
   */
  toggleSelectAll(userId: string): void {
    const perms = this.getUserPermissions(userId);
    if (!perms) return;

    const allSelected = this.modules.every(module =>
      this.getPermission(userId, module.key, 'view') &&
      this.getPermission(userId, module.key, 'edit') &&
      this.getPermission(userId, module.key, 'delete')
    );

    const newValue = !allSelected;

    this.modules.forEach(module => {
      this.updateAllPermission(userId, module.key, newValue);
    });
  }

  /**
   * Save permissions for a user
   */
  saveUserPermissions(userId: string): void {
    const perms = this.getUserPermissions(userId);
    if (!perms) {
      this.toastService.error(this.translateService.instant('settings.team.noPermissionsToSave'));
      return;
    }

    const savingMap = new Map(this.isSavingPermissions());
    savingMap.set(userId, true);
    this.isSavingPermissions.set(savingMap);

    this.userService.updateUserPermissions(userId, perms.permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPermissions) => {
          const permsMap = new Map(this.userPermissions());
          permsMap.set(userId, updatedPermissions);
          this.userPermissions.set(permsMap);

          const savingMap = new Map(this.isSavingPermissions());
          savingMap.set(userId, false);
          this.isSavingPermissions.set(savingMap);

          // Close the permissions section after successful save
          this.editingUserId.set(null);

          this.toastService.success(this.translateService.instant('settings.team.permissionsUpdated'));
          // Reload team members to reflect any role changes
          this.loadTeamMembers();
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          const savingMap = new Map(this.isSavingPermissions());
          savingMap.set(userId, false);
          this.isSavingPermissions.set(savingMap);
          // Error toast is handled by API interceptor
        }
      });
  }


  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((value) => !value);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  // Computed signal to check if password form is valid
  readonly isPasswordFormValid = computed(() => {
    const currentPassword = this.passwordForm.currentPassword();
    const newPassword = this.passwordForm.newPassword();
    const confirmPassword = this.passwordForm.confirmPassword();

    return (
      currentPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      newPassword.length >= 8 &&
      confirmPassword.trim() !== '' &&
      newPassword === confirmPassword
    );
  });

  // Computed signals for error messages
  readonly currentPasswordError = computed(() => {
    if (!this.passwordFormSubmitted()) return '';
    const currentPassword = this.passwordForm.currentPassword();
    if (!currentPassword || currentPassword.trim() === '') {
      return this.translateService.instant('settings.security.changePassword.currentPasswordRequired');
    }
    return '';
  });

  readonly newPasswordError = computed(() => {
    if (!this.passwordFormSubmitted()) return '';
    const newPassword = this.passwordForm.newPassword();
    if (!newPassword || newPassword.trim() === '') {
      return this.translateService.instant('settings.security.changePassword.newPasswordRequired');
    }
    if (newPassword.length < 8) {
      return this.translateService.instant('settings.security.changePassword.passwordMinLength');
    }
    return '';
  });

  readonly confirmPasswordError = computed(() => {
    if (!this.passwordFormSubmitted()) return '';
    const newPassword = this.passwordForm.newPassword();
    const confirmPassword = this.passwordForm.confirmPassword();
    if (!confirmPassword || confirmPassword.trim() === '') {
      return this.translateService.instant('settings.security.changePassword.confirmPasswordRequired');
    }
    if (newPassword !== confirmPassword) {
      return this.translateService.instant('settings.security.changePassword.passwordsDoNotMatch');
    }
    return '';
  });

  // Computed signals to check if fields have errors (for styling)
  readonly currentPasswordHasError = computed(() => {
    return this.passwordFormSubmitted() && (!this.passwordForm.currentPassword() || this.passwordForm.currentPassword().trim() === '');
  });

  readonly newPasswordHasError = computed(() => {
    if (!this.passwordFormSubmitted()) return false;
    const newPassword = this.passwordForm.newPassword();
    return !newPassword || newPassword.trim() === '' || newPassword.length < 8;
  });

  readonly confirmPasswordHasError = computed(() => {
    if (!this.passwordFormSubmitted()) return false;
    const newPassword = this.passwordForm.newPassword();
    const confirmPassword = this.passwordForm.confirmPassword();
    return !confirmPassword || confirmPassword.trim() === '' || newPassword !== confirmPassword;
  });

  onCancel(): void {
    // Reset forms or navigate away
  }

  onImageClick(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(this.translateService.instant('settings.errors.pleaseSelectImageFile'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(this.translateService.instant('settings.errors.imageSizeTooLarge'));
        return;
      }

      // Store the file
      this.profileImageFile.set(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileImageUrl.set(result);
      };
      reader.readAsDataURL(file);
    }

    // Reset the input so the same file can be selected again
    input.value = '';
  }

  /**
   * Handle signature image selection
   */
  onSignatureFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error(this.translateService.instant('settings.errors.pleaseSelectImageFile'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error(this.translateService.instant('settings.errors.imageSizeTooLarge'));
        return;
      }

      // Store the file
      this.signatureImageFile.set(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.signatureImageUrl.set(result);
      };
      reader.readAsDataURL(file);
    }

    // Reset the input so the same file can be selected again
    input.value = '';
  }

  /**
   * Handle signature image click to trigger file input
   */
  onSignatureImageClick(): void {
    this.signatureFileInput().nativeElement.click();
  }

  /**
   * Delete signature image
   */
  onDeleteSignature(): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('settings.signature.deleteSignature'),
      zDescription: this.translateService.instant('settings.signature.deleteSignatureConfirm'),
      zOkText: this.translateService.instant('common.delete'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.signatureImageUrl.set(null);
        this.signatureImageFile.set(null);
        this.saveSignature();
      }
    });
  }

  /**
   * Save signature
   */
  saveSignature(): void {
    this.isSavingSignature.set(true);

    const imageFile = this.signatureImageFile();
    let signatureBase64 = '';

    if (imageFile) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        signatureBase64 = base64String.split(',')[1] || base64String;
        this.updateSignature(signatureBase64);
      };
      reader.onerror = () => {
        this.isSavingSignature.set(false);
        this.toastService.error(this.translateService.instant('settings.errors.failedToReadImageFile'));
      };
      reader.readAsDataURL(imageFile);
    } else if (!this.signatureImageUrl()) {
      // Delete signature - send empty string
      this.updateSignature('');
    } else {
      // No changes
      this.isSavingSignature.set(false);
    }
  }

  /**
   * Update signature via settings API
   */
  private updateSignature(signatureBase64: string): void {
    // Get current settings to preserve other values
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (currentSettings) => {
          const updateRequest = {
            defaultCity: currentSettings?.defaultCity || '',
            categories: currentSettings?.categories || [],
            features: currentSettings?.features || [],
            amenities: currentSettings?.amenities || [],
            propertyTypes: currentSettings?.propertyTypes || [],
            emailNotification: currentSettings?.emailNotification || {
              lease: { overdue: '', pending: '', paid: '' },
              maintenance: { paid: '' },
              reservation: { confirmation: '', enter: '', left: '' }
            },
            signature: signatureBase64,
          };

          this.settingsService.updateSettings(updateRequest)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (settings) => {
                this.isSavingSignature.set(false);
                this.signatureImageFile.set(null); // Clear file reference after successful update
                
                if (settings?.signature) {
                  this.signatureImageUrl.set(this.getSignatureImageUrl(settings.signature));
                } else {
                  this.signatureImageUrl.set(null);
                }
                
                this.toastService.success(this.translateService.instant('settings.signature.signatureUpdated'));
              },
              error: (error) => {
                console.error('Error updating signature:', error);
                this.isSavingSignature.set(false);
              }
            });
        },
        error: (error) => {
          console.error('Error loading current settings:', error);
          this.isSavingSignature.set(false);
        }
      });
  }


  onSaveUserInfo(): void {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isAccountFormValid()) {
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    // Prepare user data for update
    const fullName = this.userInfo.fullName();
    const userData: { name?: string; phone?: string; avatar?: string } = {
      name: fullName.trim(),
    };

    // Only include phone if it's provided
    const phone = this.userInfo.phone();
    if (phone && phone.trim() !== '') {
      userData.phone = phone.trim();
    }

    // Handle avatar: convert file to base64 if a new image was selected
    const imageFile = this.profileImageFile();
    if (imageFile) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1] || base64String;
        userData.avatar = base64Data;

        // Call the update service with avatar
        this.updateUserData(userData);
      };
      reader.onerror = () => {
        this.isSaving.set(false);
        this.toastService.error(this.translateService.instant('settings.errors.failedToReadImageFile'));
      };
      reader.readAsDataURL(imageFile);
    } else {
      // No new image selected, update without avatar
      this.updateUserData(userData);
    }
  }

  private updateUserData(userData: { name?: string; phone?: string; avatar?: string }): void {
    // Call the update service
    this.userService.updateUser(userData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedUser) => {
        this.isSaving.set(false);
        this.formSubmitted.set(false); // Reset form validation state on success
        this.toastService.success(this.translateService.instant('settings.account.userInformation.accountInformationUpdated'));

        // Clear the file reference after successful update
        this.profileImageFile.set(null);
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error updating user info:', error);
        // Toast error is handled automatically by the API interceptor/service
      },
    });
  }

  onSavePassword(): void {
    // Mark form as submitted to show validation errors
    this.passwordFormSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isPasswordFormValid()) {
      return;
    }

    // Set loading state
    this.isUpdatingPassword.set(true);

    // Prepare password data
    const passwordData = {
      currentPassword: this.passwordForm.currentPassword().trim(),
      newPassword: this.passwordForm.newPassword().trim(),
      confirmPassword: this.passwordForm.confirmPassword().trim(),
    };

    // Call the update password service
    this.userService.updatePassword(passwordData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.passwordFormSubmitted.set(false); // Reset form validation state on success

        // Reset form fields
        this.passwordForm.currentPassword.set('');
        this.passwordForm.newPassword.set('');
        this.passwordForm.confirmPassword.set('');

        this.toastService.success(this.translateService.instant('settings.security.changePassword.passwordUpdated'));
      },
      error: (error) => {
        this.isUpdatingPassword.set(false);
        console.error('Error updating password:', error);
        // Toast error is handled automatically by the API interceptor/service
      },
    });
  }

  onLogout(): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('login.logoutConfirm.title'),
      zDescription: this.translateService.instant('login.logoutConfirm.description'),
      zOkText: this.translateService.instant('login.logoutConfirm.ok'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  /**
   * Load property settings from API
   */
  loadPropertySettings(): void {
    this.isLoadingPropertySettings.set(true);
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings) {
            this.propertySettings.defaultCity.set(settings.defaultCity || '');
            this.propertySettings.categories.set(settings.categories || []);
            this.propertySettings.features.set(settings.features || []);
            this.propertySettings.amenities.set(settings.amenities || []);
            this.propertySettings.propertyTypes.set(settings.propertyTypes || []);
            
            // Update notification settings
            if (settings.emailNotification) {
              this.notificationSettings.lease.overdue.set(settings.emailNotification.lease?.overdue || '');
              this.notificationSettings.lease.pending.set(settings.emailNotification.lease?.pending || '');
              this.notificationSettings.lease.paid.set(settings.emailNotification.lease?.paid || '');
              this.notificationSettings.maintenance.paid.set(settings.emailNotification.maintenance?.paid || '');
              this.notificationSettings.reservation.confirmation.set(settings.emailNotification.reservation?.confirmation || '');
              this.notificationSettings.reservation.enter.set(settings.emailNotification.reservation?.enter || '');
              this.notificationSettings.reservation.left.set(settings.emailNotification.reservation?.left || '');
            }
            
            // Update company image from settings
            if (settings.image) {
              this.companyInfo.image = settings.image;
            }
            
            // Update signature from settings
            if (settings.signature) {
              this.signatureImageUrl.set(this.getSignatureImageUrl(settings.signature));
            } else {
              this.signatureImageUrl.set(null);
            }
          } else {
            console.warn('Settings is null or undefined');
            // Initialize with empty values if settings is null/undefined
            this.propertySettings.defaultCity.set('');
            this.propertySettings.categories.set([]);
            this.propertySettings.features.set([]);
            this.propertySettings.amenities.set([]);
            this.propertySettings.propertyTypes.set([]);
          }
          this.isLoadingPropertySettings.set(false);
        },
        error: (error) => {
          console.error('Error loading property settings:', error);
          this.isLoadingPropertySettings.set(false);
          this.toastService.error(this.translateService.instant('settings.application.property.failedToLoadPropertySettings'));
        }
      });
  }

  /**
   * Save property settings
   */
  onSavePropertySettings(): void {
    this.isSavingPropertySettings.set(true);

    const updateRequest = {
      defaultCity: this.propertySettings.defaultCity(),
      categories: this.propertySettings.categories(),
      features: this.propertySettings.features(),
      amenities: this.propertySettings.amenities(),
      propertyTypes: this.propertySettings.propertyTypes(),
      emailNotification: {
        lease: {
          overdue: this.notificationSettings.lease.overdue(),
          pending: this.notificationSettings.lease.pending(),
          paid: this.notificationSettings.lease.paid(),
        },
        maintenance: {
          paid: this.notificationSettings.maintenance.paid(),
        },
        reservation: {
          confirmation: this.notificationSettings.reservation.confirmation(),
          enter: this.notificationSettings.reservation.enter(),
          left: this.notificationSettings.reservation.left(),
        },
      },
    };

    this.settingsService.updateSettings(updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings) {
            this.propertySettings.defaultCity.set(settings.defaultCity || '');
            this.propertySettings.categories.set(settings.categories || []);
            this.propertySettings.features.set(settings.features || []);
            this.propertySettings.amenities.set(settings.amenities || []);
            this.propertySettings.propertyTypes.set(settings.propertyTypes || []);

            // Update notification settings
            if (settings.emailNotification) {
              this.notificationSettings.lease.overdue.set(settings.emailNotification.lease?.overdue || '');
              this.notificationSettings.lease.pending.set(settings.emailNotification.lease?.pending || '');
              this.notificationSettings.lease.paid.set(settings.emailNotification.lease?.paid || '');
              this.notificationSettings.maintenance.paid.set(settings.emailNotification.maintenance?.paid || '');
              this.notificationSettings.reservation.confirmation.set(settings.emailNotification.reservation?.confirmation || '');
              this.notificationSettings.reservation.enter.set(settings.emailNotification.reservation?.enter || '');
              this.notificationSettings.reservation.left.set(settings.emailNotification.reservation?.left || '');
            }

            // Update localStorage with the updated settings
            localStorage.setItem('settings', JSON.stringify(settings));
          }
          this.isSavingPropertySettings.set(false);
          this.toastService.success(this.translateService.instant('settings.application.property.propertySettingsUpdated'));
        },
        error: (error) => {
          console.error('Error updating property settings:', error);
          this.isSavingPropertySettings.set(false);
          // Toast error is handled automatically by the API interceptor/service
        }
      });
  }

  /**
   * Add property type
   */
  addPropertyType(): void {
    const value = this.newPropertyType().trim();
    if (value && !this.propertySettings.propertyTypes().includes(value)) {
      this.propertySettings.propertyTypes.update(types => [...types, value]);
      this.newPropertyType.set('');
      this.showAddPropertyTypeInput.set(false);
    }
  }

  /**
   * Remove property type
   */
  removePropertyType(type: string): void {
    this.propertySettings.propertyTypes.update(types => types.filter(t => t !== type));
  }

  /**
   * Add feature
   */
  addFeature(): void {
    const value = this.newFeature().trim();
    if (value && !this.propertySettings.features().includes(value)) {
      this.propertySettings.features.update(features => [...features, value]);
      this.newFeature.set('');
      this.showAddFeatureInput.set(false);
    }
  }

  /**
   * Remove feature
   */
  removeFeature(feature: string): void {
    this.propertySettings.features.update(features => features.filter(f => f !== feature));
  }

  /**
   * Add amenity
   */
  addAmenity(): void {
    const value = this.newAmenity().trim();
    if (value && !this.propertySettings.amenities().includes(value)) {
      this.propertySettings.amenities.update(amenities => [...amenities, value]);
      this.newAmenity.set('');
      this.showAddAmenityInput.set(false);
    }
  }

  /**
   * Remove amenity
   */
  removeAmenity(amenity: string): void {
    this.propertySettings.amenities.update(amenities => amenities.filter(a => a !== amenity));
  }

  /**
   * Update category reference
   */
  updateCategoryReference(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const reference = input.value.trim();

    if (reference) {
      this.propertySettings.categories.update(categories =>
        categories.map(cat => cat.key === key ? { ...cat, reference } : cat)
      );
    } else {
      // If empty, find the current reference and reset
      const category = this.propertySettings.categories().find(cat => cat.key === key);
      if (category) {
        input.value = category.reference;
      }
    }
  }

  /**
   * Load notification settings from API
   */
  loadNotificationSettings(): void {
    this.isLoadingNotificationSettings.set(true);
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings?.emailNotification) {
            this.notificationSettings.lease.overdue.set(settings.emailNotification.lease?.overdue || '');
            this.notificationSettings.lease.pending.set(settings.emailNotification.lease?.pending || '');
            this.notificationSettings.lease.paid.set(settings.emailNotification.lease?.paid || '');
            this.notificationSettings.maintenance.paid.set(settings.emailNotification.maintenance?.paid || '');
            this.notificationSettings.reservation.confirmation.set(settings.emailNotification.reservation?.confirmation || '');
            this.notificationSettings.reservation.enter.set(settings.emailNotification.reservation?.enter || '');
            this.notificationSettings.reservation.left.set(settings.emailNotification.reservation?.left || '');
          } else {
            // Initialize with empty values if settings is null/undefined
            this.notificationSettings.lease.overdue.set('');
            this.notificationSettings.lease.pending.set('');
            this.notificationSettings.lease.paid.set('');
            this.notificationSettings.maintenance.paid.set('');
            this.notificationSettings.reservation.confirmation.set('');
            this.notificationSettings.reservation.enter.set('');
            this.notificationSettings.reservation.left.set('');
          }
          this.isLoadingNotificationSettings.set(false);
        },
        error: (error) => {
          console.error('Error loading notification settings:', error);
          this.isLoadingNotificationSettings.set(false);
          this.toastService.error(this.translateService.instant('settings.application.notification.failedToLoadNotificationSettings'));
        }
      });
  }

  /**
   * Save notification settings
   */
  onSaveNotificationSettings(): void {
    this.isSavingNotificationSettings.set(true);

    const updateRequest = {
      defaultCity: this.propertySettings.defaultCity(),
      categories: this.propertySettings.categories(),
      features: this.propertySettings.features(),
      amenities: this.propertySettings.amenities(),
      propertyTypes: this.propertySettings.propertyTypes(),
      emailNotification: {
        lease: {
          overdue: this.notificationSettings.lease.overdue(),
          pending: this.notificationSettings.lease.pending(),
          paid: this.notificationSettings.lease.paid(),
        },
        maintenance: {
          paid: this.notificationSettings.maintenance.paid(),
        },
        reservation: {
          confirmation: this.notificationSettings.reservation.confirmation(),
          enter: this.notificationSettings.reservation.enter(),
          left: this.notificationSettings.reservation.left(),
        },
      },
    };

    this.settingsService.updateSettings(updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings) {
            // Update notification settings
            if (settings.emailNotification) {
              this.notificationSettings.lease.overdue.set(settings.emailNotification.lease?.overdue || '');
              this.notificationSettings.lease.pending.set(settings.emailNotification.lease?.pending || '');
              this.notificationSettings.lease.paid.set(settings.emailNotification.lease?.paid || '');
              this.notificationSettings.maintenance.paid.set(settings.emailNotification.maintenance?.paid || '');
              this.notificationSettings.reservation.confirmation.set(settings.emailNotification.reservation?.confirmation || '');
              this.notificationSettings.reservation.enter.set(settings.emailNotification.reservation?.enter || '');
              this.notificationSettings.reservation.left.set(settings.emailNotification.reservation?.left || '');
            }

            // Update localStorage with the updated settings
            localStorage.setItem('settings', JSON.stringify(settings));
          }
          this.isSavingNotificationSettings.set(false);
          this.toastService.success(this.translateService.instant('settings.application.notification.notificationSettingsUpdated'));
        },
        error: (error) => {
          console.error('Error updating notification settings:', error);
          this.isSavingNotificationSettings.set(false);
          // Toast error is handled automatically by the API interceptor/service
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

